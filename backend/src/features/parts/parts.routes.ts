import express from 'express';
import {
  createOrderController,
  createPartListingController,
  getMyOrdersController,
  getOrderByIdController,
  getPartByIdController,
  searchPartsController,
  updatePartListingController,
} from './parts.controller';

export const partsRouter = express.Router();

// Spare Parts Discovery & Search
partsRouter.get('/api/v1/parts', searchPartsController);
partsRouter.get('/api/v1/parts/:id', getPartByIdController);

// Seller Listings Management (Ownership checked)
partsRouter.post('/api/v1/parts', createPartListingController);
partsRouter.patch('/api/v1/parts/:id', updatePartListingController);

// Atomic Orders & Inventory Transactions
partsRouter.post('/api/v1/orders', createOrderController);
partsRouter.get('/api/v1/orders', getMyOrdersController);
partsRouter.get('/api/v1/orders/:orderId', getOrderByIdController);

export default partsRouter;
