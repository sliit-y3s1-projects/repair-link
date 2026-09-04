import express from 'express';
import cors from 'cors';
import technicianProfileRouter from './src/features/technician-profile';
import partsRouter from './src/features/parts/parts.routes';

export const app = express();

app.use(cors());
app.use(express.json());

// Mount feature routers
app.use(technicianProfileRouter);
app.use(partsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'RepairLink API is operational',
    features: ['technician-profile', 'spare-parts-marketplace'],
  });
});

export default app;
