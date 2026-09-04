import express from 'express';
import cors from 'cors';
import technicianProfileRouter from './src/features/technician-profile/technician.routes';
import partsRouter from './src/features/parts/parts.routes';
import aiRepairRouter from './src/features/ai-repair-assistant/ai-repair.routes';
import repairRequestsRouter from './src/features/repair-requests/repair-requests.routes';
import categoriesRouter from './src/features/categories/categories.routes';
import technicianDbRouter from './src/features/technician-profile/technician-db.routes';
import adminRouter from './src/features/moderation/admin.routes';
import reviewsRouter from './src/features/reviews/reviews.routes';
import sellerProfileRouter from './src/features/profiles/seller.routes';
import reportsRouter from './src/features/moderation/reports.routes';
import { errorHandler, notFoundHandler } from './src/shared/http';

export const app = express();

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Mount feature routers
app.use(technicianProfileRouter);
app.use(partsRouter);
app.use(aiRepairRouter);
app.use(repairRequestsRouter);
app.use(categoriesRouter);
app.use(technicianDbRouter);
app.use(adminRouter);
app.use(reviewsRouter);
app.use(sellerProfileRouter);
app.use(reportsRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'RepairLink API is operational',
    features: [
      'repair-requests',
      'quotes-and-bookings',
      'technician-profile',
      'spare-parts-marketplace',
      'categories',
      'ai-repair-assistant',
    ],
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
