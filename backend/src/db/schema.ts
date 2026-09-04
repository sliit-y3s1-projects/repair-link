/** Active MVP database schema. This is the only Drizzle migration source. */
import { sql } from 'drizzle-orm';
import { boolean, check, index, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
};

export const userRole = pgEnum('user_role', ['consumer', 'technician', 'seller', 'admin']);
export const verificationStatus = pgEnum('verification_status', ['draft', 'pending', 'verified', 'rejected']);
export const repairMethod = pgEnum('repair_method', ['on_site', 'pickup_dropoff', 'shop_visit']);
export const repairStatus = pgEnum('repair_status', ['requested', 'quoted', 'booked', 'in_progress', 'waiting_for_parts', 'completed', 'cancelled', 'disputed']);
export const quoteStatus = pgEnum('quote_status', ['sent', 'accepted', 'rejected', 'withdrawn', 'expired']);
export const partCondition = pgEnum('part_condition', ['new', 'compatible', 'refurbished', 'used']);
export const orderStatus = pgEnum('order_status', ['pending', 'confirmed', 'packed', 'shipped', 'collected', 'completed', 'cancelled']);
export const inventoryMovementType = pgEnum('inventory_movement_type', ['opening', 'adjustment', 'sale']);
export const reviewStatus = pgEnum('review_status', ['published', 'hidden']);
export const reportStatus = pgEnum('report_status', ['open', 'reviewing', 'resolved', 'dismissed']);
export const reportTarget = pgEnum('report_target', ['user', 'review', 'listing', 'repair', 'order']);

export const platformUsers = pgTable('platform_users', {
  id: uuid('id').defaultRandom().primaryKey(), email: varchar('email', { length: 255 }).notNull().unique(), displayName: varchar('display_name', { length: 120 }).notNull(), phone: varchar('phone', { length: 32 }), primaryRole: userRole('primary_role').notNull().default('consumer'), isActive: boolean('is_active').notNull().default(true), ...timestamps,
});

export const consumerProfiles = pgTable('consumer_profiles', {
  userId: uuid('user_id').primaryKey().references(() => platformUsers.id), contactPreference: varchar('contact_preference', { length: 20 }).notNull().default('phone'), defaultLocationText: varchar('default_location_text', { length: 255 }), ...timestamps,
});

export const technicianProfiles = pgTable('technician_profiles', {
  userId: uuid('user_id').primaryKey().references(() => platformUsers.id), businessName: varchar('business_name', { length: 160 }).notNull(), bio: text('bio'), serviceArea: varchar('service_area', { length: 255 }).notNull(), yearsExperience: integer('years_experience').notNull().default(0), offersMobileService: boolean('offers_mobile_service').notNull().default(false), skills: jsonb('skills').$type<string[]>().notNull().default([]), services: jsonb('services').$type<unknown[]>().notNull().default([]), availability: jsonb('availability').$type<unknown[]>().notNull().default([]), portfolio: jsonb('portfolio').$type<unknown[]>().notNull().default([]), verificationStatus: verificationStatus('verification_status').notNull().default('draft'), ...timestamps,
}, (table) => [index('technician_profiles_discovery_idx').on(table.verificationStatus, table.serviceArea)]);

export const sellerProfiles = pgTable('seller_profiles', {
  userId: uuid('user_id').primaryKey().references(() => platformUsers.id), storeName: varchar('store_name', { length: 160 }).notNull(), description: text('description'), serviceArea: varchar('service_area', { length: 255 }), verificationStatus: verificationStatus('verification_status').notNull().default('draft'), ...timestamps,
}, (table) => [index('seller_profiles_discovery_idx').on(table.verificationStatus, table.serviceArea)]);

export const deviceCategories = pgTable('device_categories', {
  id: uuid('id').defaultRandom().primaryKey(), name: varchar('name', { length: 100 }).notNull(), slug: varchar('slug', { length: 120 }).notNull(), isActive: boolean('is_active').notNull().default(true), ...timestamps,
}, (table) => [uniqueIndex('device_categories_slug_unique').on(table.slug)]);

export const technicianCategories = pgTable('technician_categories', {
  technicianId: uuid('technician_id').notNull().references(() => technicianProfiles.userId, { onDelete: 'cascade' }), categoryId: uuid('category_id').notNull().references(() => deviceCategories.id), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex('technician_categories_unique').on(table.technicianId, table.categoryId), index('technician_categories_category_idx').on(table.categoryId)]);

export const repairRequests = pgTable('repair_requests', {
  id: uuid('id').defaultRandom().primaryKey(), consumerId: uuid('consumer_id').notNull().references(() => platformUsers.id), categoryId: uuid('category_id').notNull().references(() => deviceCategories.id), deviceBrand: varchar('device_brand', { length: 120 }), deviceModel: varchar('device_model', { length: 160 }), issueDescription: text('issue_description').notNull(), preferredMethod: repairMethod('preferred_method').notNull(), locationText: varchar('location_text', { length: 255 }).notNull(), preferredAt: timestamp('preferred_at', { withTimezone: true }), budgetAmount: numeric('budget_amount', { precision: 12, scale: 2 }), currency: varchar('currency', { length: 3 }).notNull().default('LKR'), status: repairStatus('status').notNull().default('requested'), ...timestamps,
}, (table) => [index('repair_requests_consumer_created_idx').on(table.consumerId, table.createdAt), index('repair_requests_leads_idx').on(table.status, table.categoryId)]);

export const repairRequestMedia = pgTable('repair_request_media', {
  id: uuid('id').defaultRandom().primaryKey(), repairRequestId: uuid('repair_request_id').notNull().references(() => repairRequests.id, { onDelete: 'cascade' }), objectKey: varchar('object_key', { length: 512 }).notNull(), mediaType: varchar('media_type', { length: 100 }).notNull(), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex('repair_request_media_object_key_unique').on(table.objectKey)]);

export const repairQuotes = pgTable('repair_quotes', {
  id: uuid('id').defaultRandom().primaryKey(), repairRequestId: uuid('repair_request_id').notNull().references(() => repairRequests.id), technicianId: uuid('technician_id').notNull().references(() => technicianProfiles.userId), amount: numeric('amount', { precision: 12, scale: 2 }).notNull(), currency: varchar('currency', { length: 3 }).notNull().default('LKR'), message: text('message'), estimatedDurationHours: integer('estimated_duration_hours'), expiresAt: timestamp('expires_at', { withTimezone: true }), status: quoteStatus('status').notNull().default('sent'), ...timestamps,
}, (table) => [uniqueIndex('repair_quotes_one_per_technician_unique').on(table.repairRequestId, table.technicianId), uniqueIndex('repair_quotes_one_accepted_per_request_unique').on(table.repairRequestId).where(sql`${table.status} = 'accepted'`), index('repair_quotes_request_status_idx').on(table.repairRequestId, table.status)]);

export const repairBookings = pgTable('repair_bookings', {
  id: uuid('id').defaultRandom().primaryKey(), repairRequestId: uuid('repair_request_id').notNull().unique().references(() => repairRequests.id), acceptedQuoteId: uuid('accepted_quote_id').notNull().unique().references(() => repairQuotes.id), scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(), ...timestamps,
});

export const repairStatusHistory = pgTable('repair_status_history', {
  id: uuid('id').defaultRandom().primaryKey(), repairRequestId: uuid('repair_request_id').notNull().references(() => repairRequests.id), changedById: uuid('changed_by_id').notNull().references(() => platformUsers.id), previousStatus: repairStatus('previous_status'), nextStatus: repairStatus('next_status').notNull(), note: text('note'), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index('repair_status_history_request_created_idx').on(table.repairRequestId, table.createdAt)]);

export const partListings = pgTable('part_listings', {
  id: uuid('id').defaultRandom().primaryKey(), sellerId: uuid('seller_id').notNull().references(() => sellerProfiles.userId), categoryId: uuid('category_id').notNull().references(() => deviceCategories.id), name: varchar('name', { length: 255 }).notNull(), sku: varchar('sku', { length: 100 }).notNull(), compatibleDevices: text('compatible_devices').notNull(), condition: partCondition('condition').notNull(), price: numeric('price', { precision: 12, scale: 2 }).notNull(), currency: varchar('currency', { length: 3 }).notNull().default('LKR'), stockQuantity: integer('stock_quantity').notNull().default(0), warrantyDays: integer('warranty_days'), deliveryOptions: text('delivery_options').array().notNull().default(sql`'{}'::text[]`), isActive: boolean('is_active').notNull().default(true), ...timestamps,
}, (table) => [uniqueIndex('part_listings_seller_sku_unique').on(table.sellerId, table.sku), index('part_listings_discovery_idx').on(table.isActive, table.categoryId), check('part_listings_stock_nonnegative', sql`${table.stockQuantity} >= 0`)]);

export const partListingImages = pgTable('part_listing_images', {
  id: uuid('id').defaultRandom().primaryKey(), listingId: uuid('listing_id').notNull().references(() => partListings.id, { onDelete: 'cascade' }), objectKey: varchar('object_key', { length: 512 }).notNull(), position: integer('position').notNull().default(0), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex('part_listing_images_object_key_unique').on(table.objectKey), uniqueIndex('part_listing_images_position_unique').on(table.listingId, table.position)]);

export const partOrders = pgTable('part_orders', {
  id: uuid('id').defaultRandom().primaryKey(), listingId: uuid('listing_id').notNull().references(() => partListings.id), sellerId: uuid('seller_id').notNull().references(() => sellerProfiles.userId), buyerId: uuid('buyer_id').notNull().references(() => platformUsers.id), quantity: integer('quantity').notNull(), unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(), currency: varchar('currency', { length: 3 }).notNull(), fulfilmentAddress: varchar('fulfilment_address', { length: 500 }).notNull(), contactPhone: varchar('contact_phone', { length: 32 }).notNull(), buyerNote: text('buyer_note'), status: orderStatus('status').notNull().default('pending'), ...timestamps,
}, (table) => [index('part_orders_buyer_created_idx').on(table.buyerId, table.createdAt), index('part_orders_seller_status_idx').on(table.sellerId, table.status), check('part_orders_quantity_positive', sql`${table.quantity} > 0`), check('part_orders_buyer_not_seller', sql`${table.buyerId} <> ${table.sellerId}`)]);

export const inventoryMovements = pgTable('inventory_movements', {
  id: uuid('id').defaultRandom().primaryKey(), listingId: uuid('listing_id').notNull().references(() => partListings.id), orderId: uuid('order_id').references(() => partOrders.id), changedById: uuid('changed_by_id').references(() => platformUsers.id), type: inventoryMovementType('type').notNull(), quantityDelta: integer('quantity_delta').notNull(), note: text('note'), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index('inventory_movements_listing_created_idx').on(table.listingId, table.createdAt)]);

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(), repairRequestId: uuid('repair_request_id').references(() => repairRequests.id), partOrderId: uuid('part_order_id').references(() => partOrders.id), authorId: uuid('author_id').notNull().references(() => platformUsers.id), subjectId: uuid('subject_id').notNull().references(() => platformUsers.id), rating: integer('rating').notNull(), body: text('body'), status: reviewStatus('status').notNull().default('published'), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex('reviews_one_per_repair_author_unique').on(table.repairRequestId, table.authorId).where(sql`${table.repairRequestId} is not null`), uniqueIndex('reviews_one_per_order_author_unique').on(table.partOrderId, table.authorId).where(sql`${table.partOrderId} is not null`), check('reviews_rating_range', sql`${table.rating} between 1 and 5`), check('reviews_exactly_one_context', sql`(${table.repairRequestId} is not null) <> (${table.partOrderId} is not null)`)]);

export const reports = pgTable('reports', {
  id: uuid('id').defaultRandom().primaryKey(), reporterId: uuid('reporter_id').notNull().references(() => platformUsers.id), targetType: reportTarget('target_type').notNull(), targetId: uuid('target_id').notNull(), reason: text('reason').notNull(), status: reportStatus('status').notNull().default('open'), resolutionNote: text('resolution_note'), resolvedById: uuid('resolved_by_id').references(() => platformUsers.id), resolvedAt: timestamp('resolved_at', { withTimezone: true }), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(), updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index('reports_status_created_idx').on(table.status, table.createdAt), index('reports_target_idx').on(table.targetType, table.targetId)]);
