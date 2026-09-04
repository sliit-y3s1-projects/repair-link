import express from 'express';
import {
  createOrderController,
  createPartListingController,
  getMyOrdersController,
  getOrderByIdController,
  getPartByIdController,
  searchPartsController,
  updatePartListingController,
  deletePartListingController,
  updateOrderStatusController,
} from './parts.controller';
import { requireDevelopmentActor } from '../../middleware/development-actor';

export const partsRouter = express.Router();

// Spare Parts Discovery & Search
partsRouter.get('/api/v1/parts', searchPartsController);
partsRouter.get('/api/v1/parts/:id', getPartByIdController);

// Seller Listings Management (Ownership checked)
partsRouter.post('/api/v1/parts', requireDevelopmentActor, createPartListingController);
partsRouter.patch('/api/v1/parts/:id', requireDevelopmentActor, updatePartListingController);
partsRouter.delete('/api/v1/parts/:id', requireDevelopmentActor, deletePartListingController);

// Atomic Orders & Inventory Transactions
partsRouter.post('/api/v1/orders', requireDevelopmentActor, createOrderController);
partsRouter.get('/api/v1/orders', requireDevelopmentActor, getMyOrdersController);
partsRouter.get('/api/v1/orders/:orderId', requireDevelopmentActor, getOrderByIdController);
partsRouter.patch('/api/v1/orders/:orderId/status', requireDevelopmentActor, updateOrderStatusController);

export default partsRouter;
