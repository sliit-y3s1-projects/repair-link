import express from 'express';
import { askAiRepairAssistantController } from './ai-repair.controller';

const aiRepairRouter = express.Router();

aiRepairRouter.post('/api/v1/ai-repair-assistant/chat', askAiRepairAssistantController);

export default aiRepairRouter;
