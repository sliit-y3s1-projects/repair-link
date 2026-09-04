import {
  BookRepairRequestInput,
  CreateRepairRequestInput,
  SearchRepairRequestsQuery,
  SubmitQuoteInput,
} from './repair-requests.schema';
import {
  DevActor,
  PhotoMetadata,
  RepairBooking,
  RepairQuote,
  RepairRequest,
  RepairStatus,
  RepairStatusHistory,
} from './repair-requests.types';

const requestsStore = new Map<string, RepairRequest>();
const statusHistoryStore = new Map<string, RepairStatusHistory[]>();

const createId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

// Normalize strings for case-insensitive matching
const normalize = (str: string) => str.toLowerCase().trim();

// Seed initial realistic Sri Lankan repair requests
const seedInitialRequests = () => {
  const now = new Date();
  const timeMinusHours = (hours: number) =>
    new Date(now.getTime() - hours * 3600000).toISOString();

  // Request 1: Fresh open lead in Colombo (Smartphones)
  const req1Id = 'req_colombo_001';
  const req1Photos: PhotoMetadata[] = [
    {
      key: 'photos/requests/req_colombo_001/screen_shattered.jpg',
      fileName: 'screen_shattered.jpg',
      fileType: 'image/jpeg',
      fileSize: 1845000,
      url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600',
      uploadedAt: timeMinusHours(4),
    },
  ];

  const req1: RepairRequest = {
    id: req1Id,
    consumerId: 'consumer_colombo_01',
    consumerName: 'Kavinda Perera',
    consumerContactPhone: '0778123456',
    deviceCategory: 'Smartphones',
    deviceBrand: 'Apple',
    deviceModel: 'iPhone 13 Pro',
    issueDescription: 'Screen glass cracked after drop. Touch still works, OLED panel intact. Need genuine replacement.',
    photos: req1Photos,
    preferredRepairMethod: 'carry_in',
    approximateLocation: 'Colombo 03 (Kollupitiya)',
    preferredTime: 'Weekday mornings after 10 AM',
    budget: 35000,
    status: 'requested',
    quotes: [],
    createdAt: timeMinusHours(4),
    updatedAt: timeMinusHours(4),
  };

  requestsStore.set(req1Id, req1);
  statusHistoryStore.set(req1Id, [
    {
      id: createId('rsh'),
      repairRequestId: req1Id,
      actor: { id: 'consumer_colombo_01', name: 'Kavinda Perera', role: 'consumer' },
      oldStatus: null,
      newStatus: 'requested',
      note: 'Repair request created by consumer',
      timestamp: timeMinusHours(4),
    },
  ]);

  // Request 2: Quoted request in Kandy (Laptops)
  const req2Id = 'req_kandy_002';
  const req2Photos: PhotoMetadata[] = [
    {
      key: 'photos/requests/req_kandy_002/dell_battery_warning.jpg',
      fileName: 'dell_battery_warning.jpg',
      fileType: 'image/jpeg',
      fileSize: 1205000,
      url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',
      uploadedAt: timeMinusHours(18),
    },
  ];

  const req2Quote: RepairQuote = {
    id: 'quote_kandy_01',
    repairRequestId: req2Id,
    technicianId: 'tech_kandy_01',
    technicianName: 'Chaminda Silva',
    technicianBusinessName: 'Hill Country Chip Spares & Repairs',
    amount: 12500,
    currency: 'LKR',
    message: 'Original Dell 56Wh replacement battery in stock with 6 months warranty. Same day turnaround.',
    estimatedDurationHours: 3,
    status: 'sent',
    createdAt: timeMinusHours(12),
    updatedAt: timeMinusHours(12),
  };

  const req2: RepairRequest = {
    id: req2Id,
    consumerId: 'consumer_kandy_02',
    consumerName: 'Malsha Wickramasinghe',
    consumerContactPhone: '0714987654',
    deviceCategory: 'Laptops',
    deviceBrand: 'Dell',
    deviceModel: 'Inspiron 15 3511',
    issueDescription: 'Battery health degraded below 40%, BIOS shows service battery warning. Needs replacement.',
    photos: req2Photos,
    preferredRepairMethod: 'pickup',
    approximateLocation: 'Kandy (Peradeniya Road)',
    preferredTime: 'Saturday anytime',
    budget: 15000,
    status: 'quoted',
    quotes: [req2Quote],
    createdAt: timeMinusHours(18),
    updatedAt: timeMinusHours(12),
  };

  requestsStore.set(req2Id, req2);
  statusHistoryStore.set(req2Id, [
    {
      id: createId('rsh'),
      repairRequestId: req2Id,
      actor: { id: 'consumer_kandy_02', name: 'Malsha Wickramasinghe', role: 'consumer' },
      oldStatus: null,
      newStatus: 'requested',
      note: 'Repair request created by consumer',
      timestamp: timeMinusHours(18),
    },
    {
      id: createId('rsh'),
      repairRequestId: req2Id,
      actor: { id: 'tech_kandy_01', name: 'Chaminda Silva', role: 'technician' },
      oldStatus: 'requested',
      newStatus: 'quoted',
      note: 'First quotation received from technician Chaminda Silva',
      timestamp: timeMinusHours(12),
    },
  ]);

  // Request 3: Booked & in-progress in Galle (Tablets)
  const req3Id = 'req_galle_003';
  const req3Photos: PhotoMetadata[] = [
    {
      key: 'photos/requests/req_galle_003/ipad_charge_port.jpg',
      fileName: 'ipad_charge_port.jpg',
      fileType: 'image/jpeg',
      fileSize: 2100000,
      url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600',
      uploadedAt: timeMinusHours(48),
    },
  ];

  const req3Quote: RepairQuote = {
    id: 'quote_galle_01',
    repairRequestId: req3Id,
    technicianId: 'tech_galle_01',
    technicianName: 'Roshan De Silva',
    technicianBusinessName: 'Southern SmartFix Labs',
    amount: 8500,
    currency: 'LKR',
    message: 'USB-C flex cable dock replacement and micro-soldering cleaning.',
    estimatedDurationHours: 4,
    status: 'accepted',
    createdAt: timeMinusHours(36),
    updatedAt: timeMinusHours(24),
  };

  const req3Booking: RepairBooking = {
    id: 'book_galle_01',
    repairRequestId: req3Id,
    acceptedQuoteId: req3Quote.id,
    scheduledAt: timeMinusHours(12),
    technicianId: 'tech_galle_01',
    technicianName: 'Roshan De Silva',
    notes: 'Consumer dropping off at Fort workshop',
    createdAt: timeMinusHours(24),
  };

  const req3: RepairRequest = {
    id: req3Id,
    consumerId: 'consumer_galle_03',
    consumerName: 'Anura Kumara',
    consumerContactPhone: '0702345678',
    deviceCategory: 'Tablets',
    deviceBrand: 'Apple',
    deviceModel: 'iPad Air 4th Gen',
    issueDescription: 'USB-C charging port loose, only charges when cable held at specific angle.',
    photos: req3Photos,
    preferredRepairMethod: 'carry_in',
    approximateLocation: 'Galle (Galle Fort)',
    preferredTime: 'Tuesday morning',
    budget: 10000,
    status: 'in_progress',
    assignedTechnicianId: 'tech_galle_01',
    assignedTechnicianName: 'Roshan De Silva',
    quotes: [req3Quote],
    booking: req3Booking,
    createdAt: timeMinusHours(48),
    updatedAt: timeMinusHours(10),
  };

  requestsStore.set(req3Id, req3);
  statusHistoryStore.set(req3Id, [
    {
      id: createId('rsh'),
      repairRequestId: req3Id,
      actor: { id: 'consumer_galle_03', name: 'Anura Kumara', role: 'consumer' },
      oldStatus: null,
      newStatus: 'requested',
      note: 'Repair request created by consumer',
      timestamp: timeMinusHours(48),
    },
    {
      id: createId('rsh'),
      repairRequestId: req3Id,
      actor: { id: 'tech_galle_01', name: 'Roshan De Silva', role: 'technician' },
      oldStatus: 'requested',
      newStatus: 'quoted',
      note: 'Quotation submitted by Southern SmartFix Labs',
      timestamp: timeMinusHours(36),
    },
    {
      id: createId('rsh'),
      repairRequestId: req3Id,
      actor: { id: 'consumer_galle_03', name: 'Anura Kumara', role: 'consumer' },
      oldStatus: 'quoted',
      newStatus: 'booked',
      note: 'Quote accepted and repair booked',
      timestamp: timeMinusHours(24),
    },
    {
      id: createId('rsh'),
      repairRequestId: req3Id,
      actor: { id: 'tech_galle_01', name: 'Roshan De Silva', role: 'technician' },
      oldStatus: 'booked',
      newStatus: 'in_progress',
      note: 'Device received at workshop. Disassembly started.',
      timestamp: timeMinusHours(10),
    },
  ]);
};

seedInitialRequests();

export const repairRequestsRepository = {
  // Find single repair request by ID
  findById(id: string): RepairRequest | undefined {
    return requestsStore.get(id);
  },

  // Create a new repair request
  create(
    input: CreateRepairRequestInput,
    consumer: { id: string; name: string; contactPhone?: string },
  ): RepairRequest {
    const id = createId('req');
    const now = new Date().toISOString();

    const newRequest: RepairRequest = {
      id,
      consumerId: consumer.id,
      consumerName: consumer.name,
      consumerContactPhone: input.contactPhone || consumer.contactPhone,
      deviceCategory: input.deviceCategory,
      deviceBrand: input.deviceBrand,
      deviceModel: input.deviceModel,
      issueDescription: input.issueDescription,
      photos: input.photos,
      preferredRepairMethod: input.preferredRepairMethod,
      approximateLocation: input.approximateLocation,
      preferredTime: input.preferredTime,
      budget: input.budget,
      status: 'requested',
      quotes: [],
      createdAt: now,
      updatedAt: now,
    };

    requestsStore.set(id, newRequest);

    // Initial immutable status history entry
    const initialHistory: RepairStatusHistory = {
      id: createId('rsh'),
      repairRequestId: id,
      actor: { id: consumer.id, name: consumer.name, role: 'consumer' },
      oldStatus: null,
      newStatus: 'requested',
      note: 'Repair request submitted by consumer',
      timestamp: now,
    };
    statusHistoryStore.set(id, [initialHistory]);

    return newRequest;
  },

  // Search & filter repair requests
  list(query: SearchRepairRequestsQuery): RepairRequest[] {
    let results = Array.from(requestsStore.values());

    if (query.status) {
      results = results.filter((r) => r.status === query.status);
    }

    if (query.category) {
      const qCat = normalize(query.category);
      results = results.filter((r) => normalize(r.deviceCategory).includes(qCat));
    }

    if (query.consumerId) {
      results = results.filter((r) => r.consumerId === query.consumerId);
    }

    if (query.technicianId) {
      results = results.filter(
        (r) =>
          r.assignedTechnicianId === query.technicianId ||
          r.quotes.some((q) => q.technicianId === query.technicianId),
      );
    }

    if (query.location) {
      const qLoc = normalize(query.location);
      results = results.filter((r) => normalize(r.approximateLocation).includes(qLoc));
    }

    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Technician lead discovery: Only open leads (requested or quoted) matching technician's categories and service area
  listLeadsForTechnician(
    categories: string[],
    serviceArea: string,
    filterCategory?: string,
    filterLocation?: string,
  ): RepairRequest[] {
    const normalizedCategories = categories.map(normalize);
    const normalizedServiceArea = normalize(serviceArea);

    let leads = Array.from(requestsStore.values()).filter(
      (r) => r.status === 'requested' || r.status === 'quoted',
    );

    // 1. Must match technician's active categories
    if (normalizedCategories.length > 0) {
      leads = leads.filter((lead) => {
        const leadCat = normalize(lead.deviceCategory);
        return normalizedCategories.some((cat) => leadCat.includes(cat) || cat.includes(leadCat));
      });
    }

    // 2. Must match technician's service area
    if (normalizedServiceArea) {
      leads = leads.filter((lead) => {
        const leadLoc = normalize(lead.approximateLocation);
        return leadLoc.includes(normalizedServiceArea) || normalizedServiceArea.includes(leadLoc);
      });
    }

    // Optional query overrides
    if (filterCategory) {
      const qCat = normalize(filterCategory);
      leads = leads.filter((l) => normalize(l.deviceCategory).includes(qCat));
    }

    if (filterLocation) {
      const qLoc = normalize(filterLocation);
      leads = leads.filter((l) => normalize(l.approximateLocation).includes(qLoc));
    }

    return leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Submit quote (Enforces one quote per technician per request)
  addQuote(
    requestId: string,
    input: SubmitQuoteInput,
    technician: DevActor,
  ): { request: RepairRequest; quote: RepairQuote } {
    const request = requestsStore.get(requestId);
    if (!request) {
      throw new Error('Repair request not found');
    }

    const quoteId = createId('quote');
    const now = new Date().toISOString();

    const quote: RepairQuote = {
      id: quoteId,
      repairRequestId: requestId,
      technicianId: technician.id,
      technicianName: technician.name,
      technicianBusinessName: technician.storeName || `${technician.name}'s Repair Services`,
      amount: input.amount,
      currency: input.currency,
      message: input.message,
      estimatedDurationHours: input.estimatedDurationHours,
      status: 'sent',
      createdAt: now,
      updatedAt: now,
    };

    request.quotes.push(quote);

    // If request was in 'requested' state, transition to 'quoted'
    if (request.status === 'requested') {
      const oldStatus = request.status;
      request.status = 'quoted';
      request.updatedAt = now;

      this.appendHistory({
        id: createId('rsh'),
        repairRequestId: requestId,
        actor: { id: technician.id, name: technician.name, role: 'technician' },
        oldStatus,
        newStatus: 'quoted',
        note: `Quote received from ${technician.name} (${input.currency} ${input.amount})`,
        timestamp: now,
      });
    } else {
      request.updatedAt = now;
    }

    requestsStore.set(requestId, request);
    return { request, quote };
  },

  // Accept quote and create booking (quoted -> booked)
  bookRequest(
    requestId: string,
    input: BookRepairRequestInput,
    consumer: DevActor,
  ): RepairRequest {
    const request = requestsStore.get(requestId);
    if (!request) {
      throw new Error('Repair request not found');
    }

    const targetQuote = request.quotes.find((q) => q.id === input.quoteId);
    if (!targetQuote) {
      throw new Error('Specified quote not found on this repair request');
    }

    const now = new Date().toISOString();

    // 1. Mark accepted quote, reject all other active quotes
    request.quotes = request.quotes.map((q) => {
      if (q.id === input.quoteId) {
        return { ...q, status: 'accepted', updatedAt: now };
      }
      return { ...q, status: 'rejected', updatedAt: now };
    });

    // 2. Assign technician
    request.assignedTechnicianId = targetQuote.technicianId;
    request.assignedTechnicianName = targetQuote.technicianName;

    // 3. Create booking
    const bookingId = createId('book');
    const booking: RepairBooking = {
      id: bookingId,
      repairRequestId: requestId,
      acceptedQuoteId: targetQuote.id,
      scheduledAt: input.scheduledAt,
      technicianId: targetQuote.technicianId,
      technicianName: targetQuote.technicianName,
      notes: input.notes,
      createdAt: now,
    };
    request.booking = booking;

    // 4. Update status and log history
    const oldStatus = request.status;
    request.status = 'booked';
    request.updatedAt = now;

    this.appendHistory({
      id: createId('rsh'),
      repairRequestId: requestId,
      actor: { id: consumer.id, name: consumer.name, role: 'consumer' },
      oldStatus,
      newStatus: 'booked',
      note: `Quote from ${targetQuote.technicianName} accepted. Repair scheduled for ${input.scheduledAt}`,
      timestamp: now,
    });

    requestsStore.set(requestId, request);
    return request;
  },

  // Transition status with immutable history recording
  updateStatus(
    requestId: string,
    newStatus: RepairStatus,
    actor: DevActor,
    note?: string,
  ): RepairRequest {
    const request = requestsStore.get(requestId);
    if (!request) {
      throw new Error('Repair request not found');
    }

    const oldStatus = request.status;
    const now = new Date().toISOString();

    request.status = newStatus;
    request.updatedAt = now;

    this.appendHistory({
      id: createId('rsh'),
      repairRequestId: requestId,
      actor: { id: actor.id, name: actor.name, role: actor.role },
      oldStatus,
      newStatus,
      note: note || `Status transitioned from ${oldStatus} to ${newStatus}`,
      timestamp: now,
    });

    requestsStore.set(requestId, request);
    return request;
  },

  // Append immutable status history
  appendHistory(history: RepairStatusHistory): void {
    const histories = statusHistoryStore.get(history.repairRequestId) || [];
    histories.push(history);
    statusHistoryStore.set(history.repairRequestId, histories);
  },

  // Get status history
  getHistory(requestId: string): RepairStatusHistory[] {
    return statusHistoryStore.get(requestId) || [];
  },

  // Clear all stores (useful for isolated unit testing)
  resetStore(): void {
    requestsStore.clear();
    statusHistoryStore.clear();
    seedInitialRequests();
  },
};

