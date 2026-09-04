import {
  CreateOrderInput,
  CreatePartListingInput,
  OrderStatus,
  PartCondition,
  SearchPartsQuery,
  UpdatePartListingInput,
} from './parts.schema';

export interface PartListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerStoreName: string;
  categoryId: string;
  categoryName: string;
  name: string;
  sku: string;
  compatibleDevices: string;
  condition: PartCondition;
  price: number;
  quantity: number;
  reservedQuantity: number;
  warrantyDays: number;
  images: string[];
  deliveryOptions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartOrder {
  id: string;
  listingId: string;
  listingName: string;
  sellerId: string;
  sellerStoreName: string;
  buyerId: string;
  buyerName: string;
  quantity: number;
  unitPrice: number; // Historical snapshot price per unit
  totalAmount: number; // Historical total (quantity * unitPrice)
  status: OrderStatus;
  shippingAddress: string;
  contactPhone: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory store with rich realistic Sri Lankan spare parts seeded data
const listingsStore = new Map<string, PartListing>();
const ordersStore = new Map<string, PartOrder>();

const createId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

// Seed initial realistic Sri Lankan listings (Pettah, Liberty Plaza, Kandy)
const seedInitialParts = () => {
  const seeds: PartListing[] = [
    {
      id: 'part_001',
      sellerId: 'seller_colombo_01',
      sellerName: 'Ruwan Perera',
      sellerStoreName: 'Pettah Tech Spares Hub',
      categoryId: 'cat_display',
      categoryName: 'Display & Screens',
      name: 'Samsung Galaxy A52 / A52s Super AMOLED Display Assembly',
      sku: 'DISP-SAM-A52-OEM',
      compatibleDevices: 'Samsung Galaxy A52 4G, Galaxy A52 5G, Galaxy A52s',
      condition: 'new',
      price: 14500,
      quantity: 8,
      reservedQuantity: 0,
      warrantyDays: 90,
      images: ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500'],
      deliveryOptions: ['Shop Pickup (1st Cross St, Pettah)', 'Island-wide Courier (Prompt Express)'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'part_002',
      sellerId: 'seller_colombo_01',
      sellerName: 'Ruwan Perera',
      sellerStoreName: 'Pettah Tech Spares Hub',
      categoryId: 'cat_battery',
      categoryName: 'Batteries',
      name: 'iPhone 11 Replacement Battery (3110mAh) with Adhesive Tape',
      sku: 'BATT-APL-IP11-HIQ',
      compatibleDevices: 'Apple iPhone 11 (A2111, A2223, A2221)',
      condition: 'new',
      price: 6800,
      quantity: 15,
      reservedQuantity: 0,
      warrantyDays: 180,
      images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500'],
      deliveryOptions: ['Shop Pickup (Pettah)', 'Courier (1-2 Days)'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'part_003',
      sellerId: 'seller_kandy_02',
      sellerName: 'Chaminda Silva',
      sellerStoreName: 'Hill Country Chip Spares',
      categoryId: 'cat_keyboard',
      categoryName: 'Keyboards & Input',
      name: 'Dell Inspiron 15 3511 / 3515 / 5510 Backlit US Keyboard',
      sku: 'KB-DELL-3511-BL',
      compatibleDevices: 'Dell Inspiron 15 3000 / 5000 Series',
      condition: 'compatible',
      price: 5200,
      quantity: 4,
      reservedQuantity: 0,
      warrantyDays: 60,
      images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500'],
      deliveryOptions: ['Pickup in Kandy (Peradeniya Rd)', 'Pronto Courier'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'part_004',
      sellerId: 'seller_liberty_03',
      sellerName: 'Faizer Mohamed',
      sellerStoreName: 'Lanka Micro Electronics',
      categoryId: 'cat_motherboard',
      categoryName: 'Logic Boards & ICs',
      name: 'Asus TUF Gaming FX505 Motherboard Power IC Controller (Refurbished)',
      sku: 'IC-ASUS-FX505-PWR',
      compatibleDevices: 'Asus TUF Gaming FX505DT, FX505DV, FX505DU',
      condition: 'refurbished',
      price: 4500,
      quantity: 6,
      reservedQuantity: 0,
      warrantyDays: 30,
      images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?w=500'],
      deliveryOptions: ['Shop Pickup (Liberty Plaza, Kollupitiya)', 'Colombo Same-Day Rider'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const part of seeds) {
    listingsStore.set(part.id, part);
  }
};

seedInitialParts();

export const partsRepository = {
  // Search and filter active spare parts
  searchListings(filters: SearchPartsQuery): PartListing[] {
    let results = Array.from(listingsStore.values()).filter((item) => item.isActive);

    if (filters.query) {
      const q = filters.query.toLowerCase().trim();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.compatibleDevices.toLowerCase().includes(q) ||
          p.sellerStoreName.toLowerCase().includes(q),
      );
    }

    if (filters.categoryId) {
      results = results.filter((p) => p.categoryId === filters.categoryId);
    }

    if (filters.condition) {
      results = results.filter((p) => p.condition === filters.condition);
    }

    if (filters.minPrice !== undefined) {
      results = results.filter((p) => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      results = results.filter((p) => p.price <= filters.maxPrice!);
    }

    if (filters.inStockOnly) {
      results = results.filter((p) => p.quantity - p.reservedQuantity > 0);
    }

    if (filters.sellerId) {
      results = results.filter((p) => p.sellerId === filters.sellerId);
    }

    return results;
  },

  findById(id: string): PartListing | undefined {
    return listingsStore.get(id);
  },

  createListing(input: CreatePartListingInput, seller: { id: string; name: string; storeName: string }): PartListing {
    const id = createId('part');
    const now = new Date().toISOString();
    const newListing: PartListing = {
      id,
      sellerId: seller.id,
      sellerName: seller.name,
      sellerStoreName: seller.storeName,
      categoryId: input.categoryId,
      categoryName: input.categoryId.replace(/^cat_/, '').replace(/_/g, ' '),
      name: input.name,
      sku: input.sku,
      compatibleDevices: input.compatibleDevices,
      condition: input.condition,
      price: input.price,
      quantity: input.quantity,
      reservedQuantity: 0,
      warrantyDays: input.warrantyDays,
      images: input.images,
      deliveryOptions: input.deliveryOptions,
      isActive: input.isActive,
      createdAt: now,
      updatedAt: now,
    };

    listingsStore.set(id, newListing);
    return newListing;
  },

  updateListing(id: string, input: UpdatePartListingInput): PartListing | undefined {
    const existing = listingsStore.get(id);
    if (!existing) return undefined;

    const updated: PartListing = {
      ...existing,
      ...input,
      price: input.price !== undefined ? input.price : existing.price,
      quantity: input.quantity !== undefined ? input.quantity : existing.quantity,
      updatedAt: new Date().toISOString(),
    };

    listingsStore.set(id, updated);
    return updated;
  },

  // Atomic transactional order execution with stock decrement & snapshot unit price
  executeOrderTransaction(
    listing: PartListing,
    buyer: { id: string; name: string },
    input: CreateOrderInput,
  ): PartOrder {
    const availableStock = listing.quantity - listing.reservedQuantity;
    if (availableStock < input.quantity) {
      throw new Error(`Insufficient stock. Requested ${input.quantity}, available ${availableStock}`);
    }

    // 1. Decrement stock atomically
    listing.quantity -= input.quantity;
    listing.updatedAt = new Date().toISOString();
    listingsStore.set(listing.id, listing);

    // 2. Snapshot unit price at purchase time (never recomputed later)
    const orderId = createId('order');
    const now = new Date().toISOString();
    const order: PartOrder = {
      id: orderId,
      listingId: listing.id,
      listingName: listing.name,
      sellerId: listing.sellerId,
      sellerStoreName: listing.sellerStoreName,
      buyerId: buyer.id,
      buyerName: buyer.name,
      quantity: input.quantity,
      unitPrice: listing.price, // SNAPSHOT: Unit price captured at purchase moment
      totalAmount: listing.price * input.quantity,
      status: 'confirmed',
      shippingAddress: input.shippingAddress,
      contactPhone: input.contactPhone,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };

    ordersStore.set(orderId, order);
    return order;
  },

  findOrderById(orderId: string): PartOrder | undefined {
    return ordersStore.get(orderId);
  },

  listOrdersByBuyer(buyerId: string): PartOrder[] {
    return Array.from(ordersStore.values()).filter((o) => o.buyerId === buyerId);
  },

  listOrdersBySeller(sellerId: string): PartOrder[] {
    return Array.from(ordersStore.values()).filter((o) => o.sellerId === sellerId);
  },
};
