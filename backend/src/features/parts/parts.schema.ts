import { z } from 'zod';

export const PartConditionEnum = z.enum(['new', 'compatible', 'refurbished', 'used']);
export type PartCondition = z.infer<typeof PartConditionEnum>;

export const OrderStatusEnum = z.enum(['pending', 'confirmed', 'packed', 'shipped', 'collected', 'completed', 'cancelled']);
export type OrderStatus = z.infer<typeof OrderStatusEnum>;

// Schema for creating a spare part listing
export const CreatePartListingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  categoryId: z.string().min(1, 'Category is required'),
  compatibleDevices: z.string().min(1, 'Compatible devices description is required'),
  sku: z.string().min(1, 'SKU or part number is required').max(100),
  condition: PartConditionEnum,
  price: z.number().positive('Price must be greater than 0'),
  quantity: z.number().int().min(0, 'Quantity must be at least 0'),
  warrantyDays: z.number().int().min(0, 'Warranty days cannot be negative').default(30),
  images: z.array(z.string().url('Must be a valid image URL')).default([]),
  deliveryOptions: z.array(z.string()).min(1, 'At least one delivery/collection option is required'),
  isActive: z.boolean().default(true),
});

export type CreatePartListingInput = z.infer<typeof CreatePartListingSchema>;

// Schema for updating a spare part listing / stock
export const UpdatePartListingSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  categoryId: z.string().optional(),
  compatibleDevices: z.string().optional(),
  sku: z.string().max(100).optional(),
  condition: PartConditionEnum.optional(),
  price: z.number().positive().optional(),
  quantity: z.number().int().min(0).optional(),
  warrantyDays: z.number().int().min(0).optional(),
  images: z.array(z.string().url()).optional(),
  deliveryOptions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field must be provided for update',
});

export type UpdatePartListingInput = z.infer<typeof UpdatePartListingSchema>;

// Schema for search & filter query parameters
export const SearchPartsQuerySchema = z.object({
  query: z.string().optional(),
  categoryId: z.string().optional(),
  condition: PartConditionEnum.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStockOnly: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  sellerId: z.string().optional(),
}).refine(
  ({ minPrice, maxPrice }) => minPrice === undefined || maxPrice === undefined || minPrice <= maxPrice,
  { message: 'Minimum price cannot exceed maximum price', path: ['maxPrice'] },
);

export type SearchPartsQuery = z.infer<typeof SearchPartsQuerySchema>;

// Schema for creating an order (captures quantity and checks stock)
export const CreateOrderSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  quantity: z.number().int().positive('Order quantity must be at least 1'),
  shippingAddress: z.string().min(5, 'Shipping / collection address is required'),
  contactPhone: z.string().min(9, 'Contact phone number is required'),
  notes: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
