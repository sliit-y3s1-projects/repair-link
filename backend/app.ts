import express from 'express';
import cors from 'cors';
import technicianProfileRouter from './src/features/technician-profile/technician.routes';
import partsRouter from './src/features/parts/parts.routes';
import aiRepairRouter from './src/features/ai-repair-assistant/ai-repair.routes';
import { errorHandler, notFoundHandler } from './src/shared/http';

export const app = express();

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Mount feature routers
app.use(technicianProfileRouter);
app.use(partsRouter);
app.use(aiRepairRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'RepairLink API is operational',
    features: ['technician-profile', 'spare-parts-marketplace', 'ai-repair-assistant'],
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
