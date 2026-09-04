import { and, asc, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';
import { db } from '../../db';
import {
  deviceCategories,
  inventoryMovements,
  partListingImages,
  partListings,
  partOrders,
  platformUsers,
  sellerProfiles,
} from '../../db/schema';
import type { CreateOrderInput, CreatePartListingInput, SearchPartsQuery, UpdatePartListingInput } from './parts.schema';

export interface PartListing {
  id: string; sellerId: string; sellerName: string; sellerStoreName: string;
  categoryId: string; categoryName: string; name: string; sku: string;
  compatibleDevices: string; condition: CreatePartListingInput['condition']; price: number;
  quantity: number; reservedQuantity: number; warrantyDays: number | null;
  images: string[]; deliveryOptions: string[]; isActive: boolean;
  createdAt: string; updatedAt: string;
}

export interface PartOrder {
  id: string; listingId: string; listingName: string; sellerId: string;
  sellerStoreName: string; buyerId: string; buyerName: string; quantity: number;
  unitPrice: number; totalAmount: number; status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'collected' | 'completed' | 'cancelled';
  shippingAddress: string; contactPhone: string; notes?: string; createdAt: string; updatedAt: string;
}

const listingFields = {
  id: partListings.id, sellerId: partListings.sellerId, sellerName: platformUsers.displayName,
  sellerStoreName: sellerProfiles.storeName, categoryId: partListings.categoryId,
  categoryName: deviceCategories.name, name: partListings.name, sku: partListings.sku,
  compatibleDevices: partListings.compatibleDevices, condition: partListings.condition,
  price: partListings.price, quantity: partListings.stockQuantity, warrantyDays: partListings.warrantyDays,
  deliveryOptions: partListings.deliveryOptions, isActive: partListings.isActive,
  createdAt: partListings.createdAt, updatedAt: partListings.updatedAt,
};

const mapListing = (row: typeof listingFields extends never ? never : any, images: string[] = []): PartListing => ({
  ...row, price: Number(row.price), reservedQuantity: 0, images,
  createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
});

const listingQuery = () => db.select(listingFields).from(partListings)
  .innerJoin(sellerProfiles, eq(partListings.sellerId, sellerProfiles.userId))
  .innerJoin(platformUsers, eq(sellerProfiles.userId, platformUsers.id))
  .innerJoin(deviceCategories, eq(partListings.categoryId, deviceCategories.id));

export const partsRepository = {
  async searchListings(filters: SearchPartsQuery): Promise<PartListing[]> {
    const conditions = [eq(partListings.isActive, true)];
    if (filters.query) {
      const term = `%${filters.query.trim()}%`;
      conditions.push(or(ilike(partListings.name, term), ilike(partListings.sku, term), ilike(partListings.compatibleDevices, term))!);
    }
    if (filters.categoryId) conditions.push(eq(partListings.categoryId, filters.categoryId));
    if (filters.condition) conditions.push(eq(partListings.condition, filters.condition));
    if (filters.minPrice !== undefined) conditions.push(gte(partListings.price, String(filters.minPrice)));
    if (filters.maxPrice !== undefined) conditions.push(lte(partListings.price, String(filters.maxPrice)));
    if (filters.inStockOnly) conditions.push(gte(partListings.stockQuantity, 1));
    if (filters.sellerId) conditions.push(eq(partListings.sellerId, filters.sellerId));
    const rows = await listingQuery().where(and(...conditions)).orderBy(desc(partListings.createdAt));
    return rows.map((row) => mapListing(row));
  },

  async findById(id: string): Promise<PartListing | undefined> {
    const [row] = await listingQuery().where(eq(partListings.id, id));
    if (!row) return undefined;
    const images = await db.select({ objectKey: partListingImages.objectKey })
      .from(partListingImages).where(eq(partListingImages.listingId, id)).orderBy(asc(partListingImages.position));
    return mapListing(row, images.map((image) => image.objectKey));
  },

  async createListing(input: CreatePartListingInput, seller: { id: string }): Promise<PartListing> {
    const listing = await db.transaction(async (tx) => {
      const [created] = await tx.insert(partListings).values({
        sellerId: seller.id, categoryId: input.categoryId, name: input.name, sku: input.sku,
        compatibleDevices: input.compatibleDevices, condition: input.condition, price: String(input.price),
        stockQuantity: input.quantity, warrantyDays: input.warrantyDays,
        deliveryOptions: input.deliveryOptions, isActive: input.isActive,
      }).returning({ id: partListings.id });
      if (!created) throw new Error('Failed to create part listing');
      if (input.images.length) await tx.insert(partListingImages).values(input.images.map((objectKey, position) => ({ listingId: created.id, objectKey, position })));
      if (input.quantity) await tx.insert(inventoryMovements).values({ listingId: created.id, changedById: seller.id, type: 'opening', quantityDelta: input.quantity });
      return created;
    });
    const result = await this.findById(listing.id);
    if (!result) throw new Error('Created listing could not be read');
    return result;
  },

  async updateListing(id: string, input: UpdatePartListingInput): Promise<PartListing | undefined> {
    const update: Record<string, unknown> = { ...input, updatedAt: new Date() };
    if (input.price !== undefined) update.price = String(input.price);
    if (input.quantity !== undefined) update.stockQuantity = input.quantity;
    delete update.images;
    await db.update(partListings).set(update).where(eq(partListings.id, id));
    return this.findById(id);
  },
  async removeListing(id: string) {
    const [row] = await db.update(partListings).set({ isActive: false, updatedAt: new Date() }).where(eq(partListings.id, id)).returning({ id: partListings.id });
    return row;
  },

  async executeOrderTransaction(listingId: string, buyer: { id: string }, input: CreateOrderInput): Promise<PartOrder> {
    const order = await db.transaction(async (tx) => {
      const [listing] = await tx.update(partListings)
        .set({ stockQuantity: sql`${partListings.stockQuantity} - ${input.quantity}`, updatedAt: new Date() })
        .where(and(eq(partListings.id, listingId), eq(partListings.isActive, true), gte(partListings.stockQuantity, input.quantity)))
        .returning({ id: partListings.id, sellerId: partListings.sellerId, price: partListings.price, currency: partListings.currency });
      if (!listing) throw new Error('Insufficient stock or inactive listing');
      const [created] = await tx.insert(partOrders).values({
        listingId: listing.id, sellerId: listing.sellerId, buyerId: buyer.id, quantity: input.quantity,
        unitPrice: listing.price, currency: listing.currency, fulfilmentAddress: input.shippingAddress,
        contactPhone: input.contactPhone, buyerNote: input.notes, status: 'confirmed',
      }).returning({ id: partOrders.id });
      if (!created) throw new Error('Failed to create order');
      await tx.insert(inventoryMovements).values({ listingId: listing.id, orderId: created.id, changedById: buyer.id, type: 'sale', quantityDelta: -input.quantity });
      return created;
    });
    const result = await this.findOrderById(order.id);
    if (!result) throw new Error('Created order could not be read');
    return result;
  },

  async findOrderById(orderId: string): Promise<PartOrder | undefined> {
    const [row] = await db.select({
      id: partOrders.id, listingId: partOrders.listingId, listingName: partListings.name,
      sellerId: partOrders.sellerId, sellerStoreName: sellerProfiles.storeName, buyerId: partOrders.buyerId,
      buyerName: platformUsers.displayName, quantity: partOrders.quantity, unitPrice: partOrders.unitPrice,
      status: partOrders.status, shippingAddress: partOrders.fulfilmentAddress, contactPhone: partOrders.contactPhone,
      notes: partOrders.buyerNote, createdAt: partOrders.createdAt, updatedAt: partOrders.updatedAt,
    }).from(partOrders).innerJoin(partListings, eq(partOrders.listingId, partListings.id))
      .innerJoin(sellerProfiles, eq(partOrders.sellerId, sellerProfiles.userId))
      .innerJoin(platformUsers, eq(partOrders.buyerId, platformUsers.id)).where(eq(partOrders.id, orderId));
    if (!row) return undefined;
    return { ...row, unitPrice: Number(row.unitPrice), totalAmount: Number(row.unitPrice) * row.quantity, status: row.status as PartOrder['status'], notes: row.notes ?? undefined, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
  },

  async listOrdersForActor(actorId: string): Promise<PartOrder[]> {
    const ids = await db.select({ id: partOrders.id }).from(partOrders)
      .where(or(eq(partOrders.buyerId, actorId), eq(partOrders.sellerId, actorId))).orderBy(desc(partOrders.createdAt));
    return (await Promise.all(ids.map((row) => this.findOrderById(row.id)))).filter((order): order is PartOrder => Boolean(order));
  },
  async updateOrderStatus(orderId: string, sellerId: string, status: PartOrder['status']) {
    const [updated] = await db.update(partOrders).set({ status, updatedAt: new Date() })
      .where(and(eq(partOrders.id, orderId), eq(partOrders.sellerId, sellerId))).returning({ id: partOrders.id });
    return updated ? this.findOrderById(updated.id) : undefined;
  },
};
