import express from 'express';
import cors from 'cors';
import { db } from './src/db';
import { usersTable } from './src/db/schema';

export const app = express();

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RepairLink API is operational' });
});

// Test database connection endpoint
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.select().from(usersTable);
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ success: false, error: 'Database connection failed', details: String(error) });
  }
});
