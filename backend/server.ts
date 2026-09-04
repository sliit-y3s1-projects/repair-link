import 'dotenv/config';
import { app } from './app';

const port = Number(process.env.PORT ?? 5000);

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}

const server = app.listen(port, () => {
  console.log(`RepairLink backend running on http://localhost:${port}`);
});

const shutdown = (signal: string) => {
  console.log(`${signal} received; shutting down`);
  server.close((error) => {
    if (error) {
      console.error('Failed to shut down cleanly', error);
      process.exitCode = 1;
    }
  });
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
