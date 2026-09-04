import {
  CreateOrderInput,
  CreatePartListingInput,
  SearchPartsQuery,
  UpdatePartListingInput,
} from './parts.schema';
import { PartListing, PartOrder, partsRepository } from './parts.repository';
import { ApiError } from '../../shared/api-response';

export interface DevActor {
  id: string;
  name: string;
  role: 'consumer' | 'technician' | 'seller' | 'admin';
  storeName?: string;
}

export const partsService = {
  // Public search for active spare parts
  searchParts(query: SearchPartsQuery): PartListing[] {
    return partsRepository.searchListings(query);
  },

  // Get single listing details
  getPartById(id: string): PartListing {
    const part = partsRepository.findById(id);
    if (!part || !part.isActive) {
      throw new ApiError(404, 'Spare part listing not found');
    }
    return part;
  },

  // Seller creates a new listing
  createListing(input: CreatePartListingInput, actor: DevActor): PartListing {
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
  updateListing(id: string, input: UpdatePartListingInput, actor: DevActor): PartListing {
    const existing = partsRepository.findById(id);
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

    const updated = partsRepository.updateListing(id, input);
    if (!updated) {
      throw new ApiError(500, 'Failed to update spare part listing');
    }
    return updated;
  },

  // Buyer places an order (Executes stock decrement transaction & snapshot unit price)
  createOrder(input: CreateOrderInput, buyer: DevActor): PartOrder {
    const listing = partsRepository.findById(input.listingId);
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
      const order = partsRepository.executeOrderTransaction(listing, {
        id: buyer.id,
        name: buyer.name,
      }, input);
      return order;
    } catch (err: unknown) {
      throw new ApiError(400, (err as Error).message || 'Order transaction failed');
    }
  },

  // Order queries
  getOrderById(orderId: string, actor: DevActor): PartOrder {
    const order = partsRepository.findOrderById(orderId);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Must be buyer, seller, or admin
    if (order.buyerId !== actor.id && order.sellerId !== actor.id && actor.role !== 'admin') {
      throw new ApiError(403, 'Forbidden: You are not authorized to view this order');
    }

    return order;
  },

  getMyOrders(actor: DevActor): PartOrder[] {
    if (actor.role === 'seller') {
      return partsRepository.listOrdersBySeller(actor.id);
    }
    return partsRepository.listOrdersByBuyer(actor.id);
  },
};
