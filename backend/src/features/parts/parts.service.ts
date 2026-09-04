import {
  CreateOrderInput,
  CreatePartListingInput,
  SearchPartsQuery,
  UpdatePartListingInput,
} from './parts.schema';
import { PartListing, PartOrder, partsRepository } from './parts.repository';
import { ApiError } from '../../shared/api-response';
import type { DevelopmentActor } from '../../shared/types/actor';

export type DevActor = DevelopmentActor;

export const partsService = {
  // Public search for active spare parts
  async searchParts(query: SearchPartsQuery): Promise<PartListing[]> {
    return partsRepository.searchListings(query);
  },

  // Get single listing details
  async getPartById(id: string): Promise<PartListing> {
    const part = await partsRepository.findById(id);
    if (!part || !part.isActive) {
      throw new ApiError(404, 'Spare part listing not found');
    }
    return part;
  },

  // Seller creates a new listing
  async createListing(input: CreatePartListingInput, actor: DevActor): Promise<PartListing> {
    if (actor.role !== 'seller' && actor.role !== 'admin') {
      throw new ApiError(403, 'Forbidden: Only verified sellers can publish spare parts listings');
    }

    const sellerInfo = {
      id: actor.id,
      name: actor.name,
      storeName: actor.storeName || `${actor.name}'s Spares Shop`,
    };

    return partsRepository.createListing(input, sellerInfo);
  },

  // Seller updates a listing (Enforces ownership & stock bounds)
  async updateListing(id: string, input: UpdatePartListingInput, actor: DevActor): Promise<PartListing> {
    const existing = await partsRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, 'Spare part listing not found');
    }

    // Ownership check per GUIDE.md
    if (existing.sellerId !== actor.id && actor.role !== 'admin') {
      throw new ApiError(403, 'Forbidden: You can only edit your own spare part listings');
    }

    // Stock constraint per GUIDE.md: "cannot reduce it below reserved/committed units"
    if (input.quantity !== undefined && input.quantity < existing.reservedQuantity) {
      throw new ApiError(
        400,
        `Cannot reduce stock below committed/reserved units (${existing.reservedQuantity})`,
      );
    }

    const updated = await partsRepository.updateListing(id, input);
    if (!updated) {
      throw new ApiError(500, 'Failed to update spare part listing');
    }
    return updated;
  },
  async removeListing(id: string, actor: DevActor) {
    const existing = await partsRepository.findById(id);
    if (!existing) throw new ApiError(404, 'Spare part listing not found');
    if (existing.sellerId !== actor.id && actor.role !== 'admin') throw new ApiError(403, 'You can only remove your own listings');
    const removed = await partsRepository.removeListing(id);
    if (!removed) throw new ApiError(404, 'Spare part listing not found');
    return removed;
  },

  // Buyer places an order (Executes stock decrement transaction & snapshot unit price)
  async createOrder(input: CreateOrderInput, buyer: DevActor): Promise<PartOrder> {
    const listing = await partsRepository.findById(input.listingId);
    if (!listing || !listing.isActive) {
      throw new ApiError(404, 'Target spare part listing does not exist or is inactive');
    }

    if (listing.sellerId === buyer.id) {
      throw new ApiError(400, 'Invalid order: Sellers cannot purchase their own listings');
    }

    const available = listing.quantity - listing.reservedQuantity;
    if (available < input.quantity) {
      throw new ApiError(
        400,
        `Insufficient stock available. Only ${available} unit(s) remaining for ${listing.name}`,
      );
    }

    try {
      const order = await partsRepository.executeOrderTransaction(listing.id, {
        id: buyer.id,
      }, input);
      return order;
    } catch (err: unknown) {
      throw new ApiError(400, (err as Error).message || 'Order transaction failed');
    }
  },

  // Order queries
  async getOrderById(orderId: string, actor: DevActor): Promise<PartOrder> {
    const order = await partsRepository.findOrderById(orderId);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Must be buyer, seller, or admin
    if (order.buyerId !== actor.id && order.sellerId !== actor.id && actor.role !== 'admin') {
      throw new ApiError(403, 'Forbidden: You are not authorized to view this order');
    }

    return order;
  },

  async getMyOrders(actor: DevActor): Promise<PartOrder[]> {
    return partsRepository.listOrdersForActor(actor.id);
  },

  async updateOrderStatus(orderId: string, status: PartOrder['status'], actor: DevActor): Promise<PartOrder> {
    if (actor.role !== 'seller' && actor.role !== 'admin') throw new ApiError(403, 'Only sellers can fulfil orders');
    const updated = await partsRepository.updateOrderStatus(orderId, actor.id, status);
    if (!updated) throw new ApiError(404, 'Order not found or not owned by this seller');
    return updated;
  },
};
