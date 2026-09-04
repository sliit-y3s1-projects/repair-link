import express from 'express';
import {
  addTechnicianCategoryController,
  addTechnicianPortfolioItemController,
  addTechnicianServiceController,
  addTechnicianSkillController,
  createTechnicianProfileController,
  deleteTechnicianCategoryController,
  deleteTechnicianPortfolioItemController,
  deleteTechnicianServiceController,
  deleteTechnicianSkillController,
  getPublicTechnicianProfileController,
  getTechnicianAvailabilityController,
  getTechnicianCategoriesController,
  getTechnicianImpactSummaryController,
  getTechnicianPortfolioController,
  getTechnicianProfileController,
  getTechnicianServicesController,
  getTechnicianSkillsController,
  listTechniciansController,
  updateTechnicianPortfolioItemController,
  updateTechnicianProfileController,
  updateTechnicianServiceController,
  upsertTechnicianAvailabilityController,
} from '../controllers/technician.controller';

const technicianProfileRouter = express.Router();

technicianProfileRouter.post('/api/technicians', createTechnicianProfileController);
technicianProfileRouter.get('/api/technicians', listTechniciansController);
technicianProfileRouter.get('/api/technicians/:technicianId', getTechnicianProfileController);
technicianProfileRouter.put('/api/technicians/:technicianId', updateTechnicianProfileController);

technicianProfileRouter.get('/api/technicians/:technicianId/skills', getTechnicianSkillsController);
technicianProfileRouter.post('/api/technicians/:technicianId/skills', addTechnicianSkillController);
technicianProfileRouter.delete('/api/technicians/:technicianId/skills/:skillId', deleteTechnicianSkillController);

technicianProfileRouter.get('/api/technicians/:technicianId/categories', getTechnicianCategoriesController);
technicianProfileRouter.post('/api/technicians/:technicianId/categories', addTechnicianCategoryController);
technicianProfileRouter.delete('/api/technicians/:technicianId/categories/:categoryId', deleteTechnicianCategoryController);

technicianProfileRouter.get('/api/technicians/:technicianId/services', getTechnicianServicesController);
technicianProfileRouter.post('/api/technicians/:technicianId/services', addTechnicianServiceController);
technicianProfileRouter.put('/api/technicians/:technicianId/services/:serviceId', updateTechnicianServiceController);
technicianProfileRouter.delete('/api/technicians/:technicianId/services/:serviceId', deleteTechnicianServiceController);

technicianProfileRouter.get('/api/technicians/:technicianId/availability', getTechnicianAvailabilityController);
technicianProfileRouter.put('/api/technicians/:technicianId/availability', upsertTechnicianAvailabilityController);

technicianProfileRouter.get('/api/technicians/:technicianId/portfolio', getTechnicianPortfolioController);
technicianProfileRouter.post('/api/technicians/:technicianId/portfolio', addTechnicianPortfolioItemController);
technicianProfileRouter.put('/api/technicians/:technicianId/portfolio/:portfolioId', updateTechnicianPortfolioItemController);
technicianProfileRouter.delete('/api/technicians/:technicianId/portfolio/:portfolioId', deleteTechnicianPortfolioItemController);

technicianProfileRouter.get('/api/technicians/:technicianId/impact', getTechnicianImpactSummaryController);
technicianProfileRouter.get('/api/technicians/:technicianId/public-profile', getPublicTechnicianProfileController);

export default technicianProfileRouter;
