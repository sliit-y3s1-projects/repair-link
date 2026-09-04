import { ApiError } from '../../shared/api-response';
import { technicianService } from '../technician-profile/technician.service';
import {
  BookRepairRequestInput,
  CancelRepairRequestInput,
  CreateRepairRequestInput,
  OpenDisputeInput,
  PresignPhotoUploadInput,
  SearchRepairRequestsQuery,
  SubmitQuoteInput,
  UpdateRepairStatusInput,
} from './repair-requests.schema';
import { repairRequestsRepository } from './repair-requests.repository';
import {
  DevActor,
  RepairQuote,
  RepairRequest,
  RepairStatus,
  RepairStatusHistory,
} from './repair-requests.types';

// Valid status transitions per GUIDE.md state machine
const VALID_TRANSITIONS: Record<RepairStatus, RepairStatus[]> = {
  requested: ['quoted', 'cancelled'],
  quoted: ['booked', 'cancelled'],
  booked: ['in_progress', 'cancelled', 'disputed'],
  in_progress: ['waiting_for_parts', 'completed', 'disputed'],
  waiting_for_parts: ['in_progress', 'completed', 'disputed'],
  completed: ['disputed'],
  cancelled: [], // Terminal state
  disputed: ['in_progress', 'completed', 'cancelled'], // Can be resolved by admin
};

// Normalize strings for matching
const normalize = (val: string) => val.toLowerCase().trim();

export const repairRequestsService = {
  // Pre-sign photo upload for object storage (S3/GCS compliant metadata & simulated signed URL)
  presignPhotoUpload(input: PresignPhotoUploadInput) {
    const sanitizedFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `photos/requests/${Date.now()}_${Math.random().toString(36).substring(2, 8)}/${sanitizedFileName}`;

    return {
      key: objectKey,
      uploadUrl: `https://storage.repairlink.lk/upload/${objectKey}?token=mock_presigned_${Date.now()}`,
      fileName: input.fileName,
      fileType: input.fileType,
      fileSize: input.fileSize,
      expiresInSeconds: 900, // 15-minute validity
      instructions: 'Upload file directly to uploadUrl with PUT method and Content-Type matching fileType.',
    };
  },

  // Consumer creates a repair request
  createRequest(input: CreateRepairRequestInput, actor: DevActor): RepairRequest {
    if (actor.role !== 'consumer' && actor.role !== 'admin') {
      throw new ApiError(403, 'Forbidden: Only consumers can create repair requests');
    }

    return repairRequestsRepository.create(input, {
      id: actor.id,
      name: actor.name,
    });
  },

  // Get single request by ID
  getRequestById(id: string, actor: DevActor): RepairRequest {
    const request = repairRequestsRepository.findById(id);
    if (!request) {
      throw new ApiError(404, 'Repair request not found');
    }

    // Role-based visibility check:
    // Consumer can only view their own requests (unless admin)
    // Technician can view if it's an open lead matching their profile OR they are assigned/quoted
    if (actor.role === 'consumer' && request.consumerId !== actor.id) {
      throw new ApiError(403, 'Forbidden: You are not authorized to view this repair request');
    }

    if (actor.role === 'technician') {
      const isAssigned = request.assignedTechnicianId === actor.id;
      const hasQuoted = request.quotes.some((q) => q.technicianId === actor.id);
      const isOpenLead = request.status === 'requested' || request.status === 'quoted';

      if (!isAssigned && !hasQuoted && !isOpenLead) {
        throw new ApiError(403, 'Forbidden: This repair job is booked with another technician');
      }
    }

    return request;
  },

  // Query and filter repair requests
  listRequests(query: SearchRepairRequestsQuery, actor: DevActor): RepairRequest[] {
    if (actor.role === 'consumer') {
      // Consumers can only view their own requests
      query.consumerId = actor.id;
    } else if (actor.role === 'technician' && !query.status) {
      // Technicians query their assigned or quoted requests
      query.technicianId = actor.id;
    }

    return repairRequestsRepository.list(query);
  },

  // Technician leads matching: "Technicians may view a lead only when it matches their active profile categories/service area."
  getLeadsForTechnician(
    actor: DevActor,
    filterCategory?: string,
    filterLocation?: string,
  ): RepairRequest[] {
    if (actor.role !== 'technician' && actor.role !== 'admin') {
      throw new ApiError(403, 'Forbidden: Only technicians can view repair leads');
    }

    let categories: string[] = actor.supportedCategories || [];
    let serviceArea: string = actor.serviceArea || '';

    // Attempt to lookup registered technician profile from technicianService
    try {
      const profile = technicianService.getProfileById(actor.id);
      if (profile) {
        categories = profile.supportedDeviceCategories.map((c) => c.name);
        serviceArea = profile.serviceArea;
      }
    } catch {
      // If profile not yet created in technician-profile store, fall back to actor headers
    }

    if (categories.length === 0 && !serviceArea && actor.role !== 'admin') {
      throw new ApiError(
        400,
        'Technician profile must have active supported device categories and a service area to discover leads',
      );
    }

    return repairRequestsRepository.listLeadsForTechnician(
      categories,
      serviceArea,
      filterCategory,
      filterLocation,
    );
  },

  // Technician submits a quote: "They may quote once per request unless a product decision explicitly permits quote revisions."
  submitQuote(
    requestId: string,
    input: SubmitQuoteInput,
    actor: DevActor,
  ): { request: RepairRequest; quote: RepairQuote } {
    if (actor.role !== 'technician' && actor.role !== 'admin') {
      throw new ApiError(403, 'Forbidden: Only technicians can submit quotes');
    }

    const request = repairRequestsRepository.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Repair request not found');
    }

    // Must be in quoteable state
    if (request.status !== 'requested' && request.status !== 'quoted') {
      throw new ApiError(
        400,
        `Cannot submit quote for a repair request with status '${request.status}'. Quotes are only accepted on 'requested' or 'quoted' requests.`,
      );
    }

    // Lead matching check: technician profile must match lead category and service area
    let categories: string[] = actor.supportedCategories || [];
    let serviceArea: string = actor.serviceArea || '';

    try {
      const profile = technicianService.getProfileById(actor.id);
      if (profile) {
        categories = profile.supportedDeviceCategories.map((c) => c.name);
        serviceArea = profile.serviceArea;
      }
    } catch {
      // Fall back to actor metadata
    }

    if (categories.length > 0) {
      const leadCat = normalize(request.deviceCategory);
      const matchesCategory = categories.some((c) => {
        const catNorm = normalize(c);
        return leadCat.includes(catNorm) || catNorm.includes(leadCat);
      });

      if (!matchesCategory && actor.role !== 'admin') {
        throw new ApiError(
          403,
          `Forbidden: Your technician profile does not cover device category '${request.deviceCategory}'`,
        );
      }
    }

    if (serviceArea) {
      const leadLoc = normalize(request.approximateLocation);
      const areaNorm = normalize(serviceArea);
      const matchesLocation = leadLoc.includes(areaNorm) || areaNorm.includes(leadLoc);

      if (!matchesLocation && actor.role !== 'admin') {
        throw new ApiError(
          403,
          `Forbidden: Request location '${request.approximateLocation}' is outside your service area '${serviceArea}'`,
        );
      }
    }

    // Strictly one quote per technician per request
    const alreadyQuoted = request.quotes.some((q) => q.technicianId === actor.id);
    if (alreadyQuoted) {
      throw new ApiError(
        400,
        'Technicians may quote only once per repair request. Quote revisions are not permitted.',
      );
    }

    return repairRequestsRepository.addQuote(requestId, input, actor);
  },

  // Consumer books a repair request by accepting a quote (quoted -> booked)
  bookRepairRequest(
    requestId: string,
    input: BookRepairRequestInput,
    actor: DevActor,
  ): RepairRequest {
    const request = repairRequestsRepository.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Repair request not found');
    }

    // Only the request consumer or admin can book
    if (request.consumerId !== actor.id && actor.role !== 'admin') {
      throw new ApiError(403, 'Forbidden: Only the consumer who created this request can book it');
    }

    if (request.status !== 'quoted') {
      throw new ApiError(
        400,
        `Cannot book repair request in '${request.status}' status. Request must be in 'quoted' status with active quotes.`,
      );
    }

    const targetQuote = request.quotes.find((q) => q.id === input.quoteId);
    if (!targetQuote) {
      throw new ApiError(404, 'Selected quote not found on this repair request');
    }

    if (targetQuote.status !== 'sent') {
      throw new ApiError(400, `Cannot accept quote with status '${targetQuote.status}'`);
    }

    return repairRequestsRepository.bookRequest(requestId, input, actor);
  },

  // Assigned technician updates work status after booking
  updateWorkStatus(
    requestId: string,
    input: UpdateRepairStatusInput,
    actor: DevActor,
  ): RepairRequest {
    const request = repairRequestsRepository.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Repair request not found');
    }

    // Check valid lifecycle transition
    const allowedTransitions = VALID_TRANSITIONS[request.status];
    if (!allowedTransitions.includes(input.status)) {
      throw new ApiError(
        400,
        `Invalid status transition: Cannot change status from '${request.status}' to '${input.status}'. Allowed transitions from '${request.status}': ${allowedTransitions.length > 0 ? allowedTransitions.join(', ') : 'None (Terminal state)'}`,
      );
    }

    // Work statuses (in_progress, waiting_for_parts, completed)
    const workStatuses: RepairStatus[] = ['in_progress', 'waiting_for_parts', 'completed'];

    if (workStatuses.includes(input.status)) {
      if (actor.role !== 'technician' && actor.role !== 'admin') {
        throw new ApiError(403, 'Forbidden: Only technicians can update repair work statuses');
      }

      if (request.assignedTechnicianId !== actor.id && actor.role !== 'admin') {
        throw new ApiError(
          403,
          'Forbidden: Only the assigned technician for this booking can update its work status',
        );
      }
    } else if (input.status === 'cancelled') {
      // Consumers cancel
      if (request.consumerId !== actor.id && actor.role !== 'admin') {
        throw new ApiError(403, 'Forbidden: Only the consumer can cancel this repair request');
      }
    } else if (input.status === 'disputed') {
      // Either participant may open dispute
      const isConsumer = request.consumerId === actor.id;
      const isTechnician = request.assignedTechnicianId === actor.id;

      if (!isConsumer && !isTechnician && actor.role !== 'admin') {
        throw new ApiError(
          403,
          'Forbidden: Only participants (consumer or assigned technician) can open a dispute',
        );
      }
    }

    return repairRequestsRepository.updateStatus(requestId, input.status, actor, input.note);
  },

  // Consumer cancels repair request
  cancelRequest(
    requestId: string,
    input: CancelRepairRequestInput,
    actor: DevActor,
  ): RepairRequest {
    const request = repairRequestsRepository.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Repair request not found');
    }

    if (request.consumerId !== actor.id && actor.role !== 'admin') {
      throw new ApiError(403, 'Forbidden: Only the consumer who created this request can cancel it');
    }

    if (!['requested', 'quoted', 'booked'].includes(request.status)) {
      throw new ApiError(
        400,
        `Cannot cancel repair request in '${request.status}' state. Cancellation is only permitted for 'requested', 'quoted', or 'booked' requests.`,
      );
    }

    const note = input.reason
      ? `Cancelled by consumer: ${input.reason}`
      : 'Cancelled by consumer';

    return repairRequestsRepository.updateStatus(requestId, 'cancelled', actor, note);
  },

  // Open a dispute: "either participant may open a dispute."
  openDispute(
    requestId: string,
    input: OpenDisputeInput,
    actor: DevActor,
  ): RepairRequest {
    const request = repairRequestsRepository.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Repair request not found');
    }

    const isConsumer = request.consumerId === actor.id;
    const isAssignedTech = request.assignedTechnicianId === actor.id;

    if (!isConsumer && !isAssignedTech && actor.role !== 'admin') {
      throw new ApiError(
        403,
        'Forbidden: Only the consumer or assigned technician can open a dispute on this repair request',
      );
    }

    if (!['booked', 'in_progress', 'waiting_for_parts', 'completed'].includes(request.status)) {
      throw new ApiError(
        400,
        `Cannot open dispute on request in '${request.status}' status. Disputes can only be opened after booking.`,
      );
    }

    const disputeNote = `Dispute opened by ${actor.role} (${actor.name}): ${input.reason}`;
    return repairRequestsRepository.updateStatus(requestId, 'disputed', actor, disputeNote);
  },

  // Get immutable status history
  getStatusHistory(requestId: string, actor: DevActor): RepairStatusHistory[] {
    const request = repairRequestsRepository.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Repair request not found');
    }

    // Access control
    if (actor.role === 'consumer' && request.consumerId !== actor.id) {
      throw new ApiError(403, 'Forbidden: You are not authorized to view this request history');
    }

    if (actor.role === 'technician') {
      const isAssigned = request.assignedTechnicianId === actor.id;
      const hasQuoted = request.quotes.some((q) => q.technicianId === actor.id);
      const isOpen = request.status === 'requested' || request.status === 'quoted';

      if (!isAssigned && !hasQuoted && !isOpen) {
        throw new ApiError(403, 'Forbidden: You are not authorized to view this request history');
      }
    }

    return repairRequestsRepository.getHistory(requestId);
  },
};

