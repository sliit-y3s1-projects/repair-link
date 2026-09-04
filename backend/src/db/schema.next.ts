/**
 * Proposed production domain schema for Repair Link.
 *
 * This file is intentionally NOT connected to drizzle.config.ts yet. Review it,
 * reconcile it with schema.ts, then replace the active schema and generate a
 * migration. Do not run db:push against this draft.
 */
import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
};

export const userRole = pgEnum('user_role', ['consumer', 'technician', 'seller', 'admin']);
export const repairStatus = pgEnum('repair_status', ['requested', 'quoted', 'booked', 'in_progress', 'waiting_for_parts', 'completed', 'cancelled', 'disputed']);
export const quoteStatus = pgEnum('quote_status', ['sent', 'accepted', 'rejected', 'withdrawn', 'expired']);
export const partCondition = pgEnum('part_condition', ['new', 'compatible', 'refurbished', 'used']);
export const orderStatus = pgEnum('order_status', ['pending', 'confirmed', 'shipped', 'collected', 'completed', 'cancelled']);

export const platformUsers = pgTable('platform_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  displayName: varchar('display_name', { length: 120 }).notNull(),
  phone: varchar('phone', { length: 32 }),
  role: userRole('role').notNull().default('consumer'),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
  isActive: boolean('is_active').notNull().default(true),
  ...timestamps,
});

export const technicianProfiles = pgTable('technician_profiles', {
  userId: uuid('user_id').primaryKey().references(() => platformUsers.id, { onDelete: 'cascade' }),
  businessName: varchar('business_name', { length: 160 }).notNull(),
  bio: text('bio'),
  serviceArea: varchar('service_area', { length: 255 }).notNull(),
  yearsExperience: integer('years_experience').notNull().default(0),
  responseRate: integer('response_rate').notNull().default(0),
  isVerified: boolean('is_verified').notNull().default(false),
  ...timestamps,
});

export const sellerProfiles = pgTable('seller_profiles', {
  userId: uuid('user_id').primaryKey().references(() => platformUsers.id, { onDelete: 'cascade' }),
  storeName: varchar('store_name', { length: 160 }).notNull(),
  bio: text('bio'),
  serviceArea: varchar('service_area', { length: 255 }),
  isVerified: boolean('is_verified').notNull().default(false),
  ...timestamps,
});

export const deviceCategories = pgTable('device_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  ...timestamps,
});

export const repairRequests = pgTable('repair_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  consumerId: uuid('consumer_id').notNull().references(() => platformUsers.id),
  categoryId: uuid('category_id').notNull().references(() => deviceCategories.id),
  deviceBrand: varchar('device_brand', { length: 120 }),
  deviceModel: varchar('device_model', { length: 160 }),
  issueDescription: text('issue_description').notNull(),
  preferredMethod: varchar('preferred_method', { length: 40 }).notNull(),
  locationText: varchar('location_text', { length: 255 }).notNull(),
  preferredAt: timestamp('preferred_at', { withTimezone: true }),
  budgetAmount: numeric('budget_amount', { precision: 12, scale: 2 }),
  status: repairStatus('status').notNull().default('requested'),
  ...timestamps,
});

export const repairQuotes = pgTable('repair_quotes', {
  id: uuid('id').defaultRandom().primaryKey(),
  repairRequestId: uuid('repair_request_id').notNull().references(() => repairRequests.id, { onDelete: 'cascade' }),
  technicianId: uuid('technician_id').notNull().references(() => platformUsers.id),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('LKR'),
  message: text('message'),
  estimatedDurationHours: integer('estimated_duration_hours'),
  status: quoteStatus('status').notNull().default('sent'),
  ...timestamps,
});

export const repairBookings = pgTable('repair_bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  repairRequestId: uuid('repair_request_id').notNull().unique().references(() => repairRequests.id),
  acceptedQuoteId: uuid('accepted_quote_id').notNull().unique().references(() => repairQuotes.id),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  ...timestamps,
});

export const repairStatusHistory = pgTable('repair_status_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  repairRequestId: uuid('repair_request_id').notNull().references(() => repairRequests.id, { onDelete: 'cascade' }),
  changedById: uuid('changed_by_id').notNull().references(() => platformUsers.id),
  status: repairStatus('status').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const partListings = pgTable('part_listings', {
  id: uuid('id').defaultRandom().primaryKey(),
  sellerId: uuid('seller_id').notNull().references(() => platformUsers.id),
  categoryId: uuid('category_id').notNull().references(() => deviceCategories.id),
  name: varchar('name', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 100 }).unique(),
  compatibleDevices: text('compatible_devices'),
  condition: partCondition('condition').notNull(),
  price: numeric('price', { precision: 12, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull().default(0),
  warrantyDays: integer('warranty_days'),
  isActive: boolean('is_active').notNull().default(true),
  ...timestamps,
});

export const partOrders = pgTable('part_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  listingId: uuid('listing_id').notNull().references(() => partListings.id),
  buyerId: uuid('buyer_id').notNull().references(() => platformUsers.id),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  status: orderStatus('status').notNull().default('pending'),
  ...timestamps,
});

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  repairRequestId: uuid('repair_request_id').references(() => repairRequests.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').notNull().references(() => platformUsers.id),
  recipientId: uuid('recipient_id').notNull().references(() => platformUsers.id),
  body: text('body').notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  repairRequestId: uuid('repair_request_id').notNull().references(() => repairRequests.id),
  authorId: uuid('author_id').notNull().references(() => platformUsers.id),
  subjectId: uuid('subject_id').notNull().references(() => platformUsers.id),
  rating: integer('rating').notNull(),
  body: text('body'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const impactEvents = pgTable('impact_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => platformUsers.id),
  repairRequestId: uuid('repair_request_id').notNull().references(() => repairRequests.id),
  points: integer('points').notNull(),
  reason: varchar('reason', { length: 255 }).notNull(),
  awardedById: uuid('awarded_by_id').references(() => platformUsers.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const reports = pgTable('reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  reporterId: uuid('reporter_id').notNull().references(() => platformUsers.id),
  reportedUserId: uuid('reported_user_id').references(() => platformUsers.id),
  repairRequestId: uuid('repair_request_id').references(() => repairRequests.id),
  reason: text('reason').notNull(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  resolvedById: uuid('resolved_by_id').references(() => platformUsers.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
