import express from 'express';
import {
  bookRepairRequestController,
  cancelRepairRequestController,
  createRepairRequestController,
  getRepairRequestByIdController,
  getRepairStatusHistoryController,
  getTechnicianLeadsController,
  listRepairRequestsController,
  openDisputeController,
  presignPhotoUploadController,
  submitQuoteController,
  updateRepairStatusController,
} from './repair-requests.controller';

export const repairRequestsRouter = express.Router();

// Object Storage Pre-Signed Upload URL (Photo metadata)
repairRequestsRouter.post(
  '/api/v1/repair-requests/photos/presign',
  presignPhotoUploadController,
);

// Technician Leads Discovery (Matches active profile categories & service area)
// Note: Must be declared before /:id route to avoid route parameter collision
repairRequestsRouter.get(
  '/api/v1/repair-requests/leads',
  getTechnicianLeadsController,
);

// Repair Requests CRUD & Search
repairRequestsRouter.post(
  '/api/v1/repair-requests',
  createRepairRequestController,
);
repairRequestsRouter.get(
  '/api/v1/repair-requests',
  listRepairRequestsController,
);
repairRequestsRouter.get(
  '/api/v1/repair-requests/:id',
  getRepairRequestByIdController,
);

// Technician Quoting (Strictly 1 quote per technician per request)
repairRequestsRouter.post(
  '/api/v1/repair-requests/:id/quotes',
  submitQuoteController,
);

// Consumer Booking (Accepts quote and books repair)
repairRequestsRouter.post(
  '/api/v1/repair-requests/:id/book',
  bookRepairRequestController,
);

// Lifecycle Transitions & Status Updates
repairRequestsRouter.patch(
  '/api/v1/repair-requests/:id/status',
  updateRepairStatusController,
);

// Consumer Cancellation
repairRequestsRouter.post(
  '/api/v1/repair-requests/:id/cancel',
  cancelRepairRequestController,
);

// Dispute Opening (Either consumer or assigned technician)
repairRequestsRouter.post(
  '/api/v1/repair-requests/:id/dispute',
  openDisputeController,
);

// Immutable Status History Audit Trail
repairRequestsRouter.get(
  '/api/v1/repair-requests/:id/history',
  getRepairStatusHistoryController,
);

export default repairRequestsRouter;

