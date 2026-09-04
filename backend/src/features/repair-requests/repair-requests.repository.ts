import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../../db';
import { deviceCategories, repairBookings, repairQuotes, repairRequests, repairStatusHistory, technicianCategories } from '../../db/schema';
import { repairStatusValues, type CreateQuote, type CreateRepairRequest, type UpdateRepairRequest } from './repair-requests.schema';

const transitions: Record<string, readonly string[]> = {
  requested: ['quoted', 'cancelled'], quoted: ['booked', 'cancelled'], booked: ['in_progress', 'cancelled', 'disputed'],
  in_progress: ['waiting_for_parts', 'completed', 'disputed'], waiting_for_parts: ['in_progress', 'completed', 'disputed'],
  completed: [], cancelled: [], disputed: ['completed', 'cancelled'],
};

export const repairRequestsRepository = {
  validTransition(from: string, to: string) { return transitions[from]?.includes(to) ?? false; },
  async create(consumerId: string, input: CreateRepairRequest) {
    const [row] = await db.insert(repairRequests).values({ ...input, consumerId, budgetAmount: input.budgetAmount === undefined ? undefined : String(input.budgetAmount) }).returning();
    if (!row) throw new Error('Could not create repair request');
    await db.insert(repairStatusHistory).values({ repairRequestId: row.id, changedById: consumerId, nextStatus: 'requested', note: 'Request created' });
    return row;
  },
  async listForConsumer(consumerId: string) { return db.select().from(repairRequests).where(eq(repairRequests.consumerId, consumerId)).orderBy(desc(repairRequests.createdAt)); },
  async get(id: string) { const [row] = await db.select().from(repairRequests).where(eq(repairRequests.id, id)); return row; },
  async update(id: string, consumerId: string, input: UpdateRepairRequest) {
    const values = { ...input, budgetAmount: input.budgetAmount === undefined ? undefined : String(input.budgetAmount), updatedAt: new Date() };
    const [row] = await db.update(repairRequests).set(values).where(and(eq(repairRequests.id, id), eq(repairRequests.consumerId, consumerId), eq(repairRequests.status, 'requested'))).returning();
    return row;
  },
  async remove(id: string, consumerId: string) {
    const [row] = await db.delete(repairRequests).where(and(eq(repairRequests.id, id), eq(repairRequests.consumerId, consumerId), eq(repairRequests.status, 'requested'))).returning({ id: repairRequests.id });
    return row;
  },
  async quotes(requestId: string) { return db.select().from(repairQuotes).where(eq(repairQuotes.repairRequestId, requestId)).orderBy(asc(repairQuotes.createdAt)); },
  async isParticipant(requestId: string, actorId: string) {
    const [request] = await db.select({ id: repairRequests.id }).from(repairRequests).where(and(eq(repairRequests.id, requestId), eq(repairRequests.consumerId, actorId)));
    if (request) return true;
    const [quote] = await db.select({ id: repairQuotes.id }).from(repairQuotes).where(and(eq(repairQuotes.repairRequestId, requestId), eq(repairQuotes.technicianId, actorId)));
    return Boolean(quote);
  },
  async assignedTechnicianId(requestId: string) {
    const [row] = await db.select({ technicianId: repairQuotes.technicianId }).from(repairBookings)
      .innerJoin(repairQuotes, eq(repairBookings.acceptedQuoteId, repairQuotes.id))
      .where(eq(repairBookings.repairRequestId, requestId));
    return row?.technicianId;
  },
  async addQuote(requestId: string, technicianId: string, input: CreateQuote) {
    const [eligible] = await db.select({ id: repairRequests.id }).from(repairRequests)
      .innerJoin(technicianCategories, eq(repairRequests.categoryId, technicianCategories.categoryId))
      .where(and(eq(repairRequests.id, requestId), eq(technicianCategories.technicianId, technicianId), inArray(repairRequests.status, ['requested', 'quoted'])));
    if (!eligible) throw new Error('Technician is not eligible for this repair request');
    const [quote] = await db.insert(repairQuotes).values({ repairRequestId: requestId, technicianId, amount: String(input.amount), message: input.message, estimatedDurationHours: input.estimatedDurationHours, expiresAt: input.expiresAt }).returning();
    if (!quote) throw new Error('Could not create quote');
    await db.update(repairRequests).set({ status: 'quoted', updatedAt: new Date() }).where(and(eq(repairRequests.id, requestId), eq(repairRequests.status, 'requested')));
    return quote;
  },
  async acceptQuote(requestId: string, quoteId: string, consumerId: string, scheduledAt: Date) {
    const acceptedQuoteId = await db.transaction(async (tx) => {
      const [request] = await tx.select().from(repairRequests).where(and(eq(repairRequests.id, requestId), eq(repairRequests.consumerId, consumerId)));
      const [quote] = await tx.select().from(repairQuotes).where(and(eq(repairQuotes.id, quoteId), eq(repairQuotes.repairRequestId, requestId), eq(repairQuotes.status, 'sent')));
      if (!request || !quote || request.status !== 'quoted') throw new Error('Request or quote is no longer available');
      await tx.update(repairQuotes).set({ status: 'accepted', updatedAt: new Date() }).where(eq(repairQuotes.id, quoteId));
      await tx.update(repairQuotes).set({ status: 'rejected', updatedAt: new Date() }).where(and(eq(repairQuotes.repairRequestId, requestId), sql`${repairQuotes.id} <> ${quoteId}`, eq(repairQuotes.status, 'sent')));
      await tx.insert(repairBookings).values({ repairRequestId: requestId, acceptedQuoteId: quoteId, scheduledAt });
      await tx.update(repairRequests).set({ status: 'booked', updatedAt: new Date() }).where(eq(repairRequests.id, requestId));
      await tx.insert(repairStatusHistory).values({ repairRequestId: requestId, changedById: consumerId, previousStatus: 'quoted', nextStatus: 'booked', note: 'Quote accepted' });
      return quote.id;
    });
    const [accepted] = await db.select().from(repairQuotes).where(eq(repairQuotes.id, acceptedQuoteId));
    if (!accepted) throw new Error('Accepted quote could not be read');
    return accepted;
  },
  async updateStatus(id: string, actorId: string, status: typeof repairStatusValues[number], note?: string) {
    return db.transaction(async (tx) => {
      const [request] = await tx.select().from(repairRequests).where(eq(repairRequests.id, id));
      if (!request || !this.validTransition(request.status, status)) throw new Error('Invalid repair status transition');
      await tx.update(repairRequests).set({ status, updatedAt: new Date() }).where(eq(repairRequests.id, id));
      await tx.insert(repairStatusHistory).values({ repairRequestId: id, changedById: actorId, previousStatus: request.status, nextStatus: status, note });
      return { ...request, status };
    });
  },
  async history(id: string) { return db.select().from(repairStatusHistory).where(eq(repairStatusHistory.repairRequestId, id)).orderBy(asc(repairStatusHistory.createdAt)); },
};
