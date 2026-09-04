import { Request, Response } from 'express';
import { z } from 'zod';
import { technicianService } from './technician.service';
import { ApiError, sendError, sendSuccess } from '../../shared/api-response';
import {
  addCategorySchema,
  addPortfolioItemSchema,
  addServiceSchema,
  addSkillSchema,
  createTechnicianProfileSchema,
  queryFiltersSchema,
  technicianIdParamSchema,
  updatePortfolioItemSchema,
  updateServiceSchema,
  updateTechnicianProfileSchema,
  upsertAvailabilitySchema,
} from './technician.schema';

const getValidationErrors = (error: z.ZodError) =>
  error.issues.map((issue) => issue.message);

const parseBody = <T>(req: Request, schema: z.ZodType<T>, fieldName = 'request body') => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, `Invalid ${fieldName}`, getValidationErrors(result.error));
  }

  return result.data;
};

const parseParams = <T>(req: Request, schema: z.ZodType<T>, fieldName = 'request params') => {
  const result = schema.safeParse(req.params);
  if (!result.success) {
    throw new ApiError(400, `Invalid ${fieldName}`, getValidationErrors(result.error));
  }

  return result.data;
};

const parseQuery = <T>(req: Request, schema: z.ZodType<T>, fieldName = 'query parameters') => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    throw new ApiError(400, `Invalid ${fieldName}`, getValidationErrors(result.error));
  }

  return result.data;
};

export const createTechnicianProfileController = async (req: Request, res: Response) => {
  try {
    const payload = parseBody(req, createTechnicianProfileSchema, 'technician profile');
    const profile = technicianService.createProfile(payload);
    return sendSuccess(res, 201, 'Technician profile created successfully', profile);
  } catch (error) {
    if (error instanceof ApiError) {
      return sendError(res, error.statusCode, error.message, error.errors);
    }

    return sendError(res, 500, 'Unexpected server error', ['An unexpected error occurred']);
  }
};

export const listTechniciansController = async (req: Request, res: Response) => {
  try {
    const filters = parseQuery(req, queryFiltersSchema, 'search filters');
    const technicians = technicianService.listTechnicians(filters);
    return sendSuccess(res, 200, 'Technicians retrieved successfully', technicians);
  } catch (error) {
    if (error instanceof ApiError) {
      return sendError(res, error.statusCode, error.message, error.errors);
    }

    return sendError(res, 500, 'Unexpected server error', ['An unexpected error occurred']);
  }
};

export const getTechnicianProfileController = async (req: Request, res: Response) => {
  try {
    const { technicianId } = parseParams(req, technicianIdParamSchema, 'technician ID');
    const profile = technicianService.getProfileById(technicianId);
    return sendSuccess(res, 200, 'Technician profile retrieved successfully', profile);
  } catch (error) {
    if (error instanceof ApiError) {
      return sendError(res, error.statusCode, error.message, error.errors);
    }

    return sendError(res, 500, 'Unexpected server error', ['An unexpected error occurred']);
  }
};

export const updateTechnicianProfileController = async (req: Request, res: Response) => {
  try {
    const { technicianId } = parseParams(req, technicianIdParamSchema, 'technician ID');
    const updates = parseBody(req, updateTechnicianProfileSchema, 'technician profile update');
    const profile = technicianService.updateProfile(technicianId, updates);
    return sendSuccess(res, 200, 'Technician profile updated successfully', profile);
  } catch (error) {
    if (error instanceof ApiError) {
      return sendError(res, error.statusCode, error.message, error.errors);
    }

    return sendError(res, 500, 'Unexpected server error', ['An unexpected error occurred']);
  }
};

export const getTechnicianSkillsController = async (req: Request, res: Response) => {
  try {
    const { technicianId } = parseParams(req, technicianIdParamSchema, 'technician ID');
    const skills = technicianService.getSkills(technicianId);
    return sendSuccess(res, 200, 'Technician skills retrieved successfully', skills);
  } catch (error) {
    if (error instanceof ApiError) {
      return sendError(res, error.statusCode, error.message, error.errors);
    }

    return sendError(res, 500, 'Unexpected server error', ['An unexpected error occurred']);
  }
};

export const addTechnicianSkillController = async (req: Request, res: Response) => {
  try {
    const { technicianId } = parseParams(req, technicianIdParamSchema, 'technician ID');
    const payload = parseBody(req, addSkillSchema, 'skill');
    const skill = technicianService.addSkill(technicianId, payload.name);
    return sendSuccess(res, 201, 'Technician skill added successfully', skill);
  } catch (error) {
    if (error instanceof ApiError) {
      return sendError(res, error.statusCode, error.message, error.errors);
    }

    return sendError(res, 500, 'Unexpected server error', ['An unexpected error occurred']);
  }
};

export const deleteTechnicianSkillController = async (req: Request, res: Response) => {
  try {
    const { technicianId, skillId } = parseParams(req, z.object({ technicianId: z.string().trim().min(1), skillId: z.string().trim().min(1) }), 'skill ID');
    const profile = technicianService.removeSkill(technicianId, skillId);
    return sendSuccess(res, 200, 'Technician skill removed successfully', profile);
  } catch (error) {
    if (error instanceof ApiError) {
      return sendError(res, error.statusCode, error.message, error.errors);
    }

    return sendError(res, 500, 'Unexpected server error', ['An unexpected error occurred']);
  }
};

export const getTechnicianCategoriesController = async (req: Request, res: Response) => {
  try {
    const { technicianId } = parseParams(req, technicianIdParamSchema, 'technician ID');
    const categories = technicianService.getCategories(technicianId);
    return sendSuccess(res, 200, 'Technician device categories retrieved successfully', categories);
  } catch (error) {
    if (error instanceof ApiError) {
      return sendError(res, error.statusCode, error.message, error.errors);
    }

    return sendError(res, 500, 'Unexpected server error', ['An unexpected error occurred']);
  }
};

export const addTechnicianCategoryController = async (req: Request, res: Response) => {
  try {
    const { technicianId } = parseParams(req, technicianIdParamSchema, 'technician ID');
    const payload = parseBody(req, addCategorySchema, 'category');
    const category = technicianService.addCategory(technicianId, payload.name);
    return sendSuccess(res, 201, 'Technician device category added successfully', category);
  } catch (error) {
    if (error instanceof ApiError) {
      return sendError(res, error.statusCode, error.message, error.errors);
    }

    return sendError(res, 500, 'Unexpected server error', ['An unexpected error occurred']);
  }
};

export const deleteTechnicianCategoryController = async (req: Request, res: Response) => {
  try {
    const { technicianId, categoryId } = parseParams(req, z.object({ technicianId: z.string().trim().min(1), categoryId: z.string().trim().min(1) }), 'category ID');
    const profile = technicianService.removeCategory(technicianId, categoryId);
    return sendSuccess(res, 200, 'Technician device category removed successfully', profile);
  } catch (error) {
    if (error instanceof ApiError) {
      return sendError(res, error.statusCode, error.message, error.errors);
    }

    return sendError(res, 500, 'Unexpected server error', ['An unexpected error occurred']);
  }
};

export const getTechnicianServicesController = async (req: Request, res: Response) => {
  try {
    const { technicianId } = parseParams(req, technicianIdParamSchema, 'technician ID');
    const services = technicianService.getServices(technicianId);
    return sendSuccess(res, 200, 'Technician services retrieved successfully', services);
  } catch (error) {
    if (error instanceof ApiError) {
      return sendError(res, error.statusCode, error.message, error.errors);
    }

    return sendError(res, 500, 'Unexpected server error', ['An unexpected error occurred']);
  }
};

export const addTechnicianServiceController = async (req: Request, res: Response) => {
  try {
    const { technicianId } = parseParams(req, technicianIdParamSchema, 'technician ID');
    const payload = parseBody(req, addServiceSchema, 'service');
    const service = technicianService.addService(technicianId, payload);
    return sendSuccess(res, 201, 'Technician service added successfully', service);
  } catch (error) {
    if (error instanceof ApiError) {
      return sendError(res, error.statusCode, error.message, error.errors);
    }

    return sendError(res, 500, 'Unexpected server error', ['An unexpected error occurred']);
  }
};

export const updateTechnicianServiceController = async (req: Request, res: Response) => {
  try {
    const { technicianId, serviceId } = parseParams(req, z.object({ technicianId: z.string().trim().min(1), serviceId: z.string().trim().min(1) }), 'service ID');
    const payload = parseBody(req, updateServiceSchema, 'service update');
    const service = technicianService.updateService(technicianId, serviceId, payload);
    return sendSuccess(res, 200, 'Technician service updated successfully', service);
  } catch (error) {
    if (error instanceof ApiError) {
      return sendError(res, error.statusCode, error.message, error.errors);
    }

    return sendError(res, 500, 'Unexpected server error', ['An unexpected error occurred']);
  }
};

export const deleteTechnicianServiceController = async (req: Request, res: Response) => {
  try {
    const { technicianId, serviceId } = parseParams(req, z.object({ technicianId: z.string().trim().min(1), serviceId: z.string().trim().min(1) }), 'service ID');
    const profile = technicianService.deleteService(technicianId, serviceId);
    return sendSuccess(res, 200, 'Technician service removed successfully', profile);
  } catch (error) {
    if (error instanceof ApiError) {
      return sendError(res, error.statusCode, error.message, error.errors);
    }

    return sendError(res, 500, 'Unexpected server error', ['An unexpected error occurred']);
  }
};

export const getTechnicianAvailabilityController = async (req: Request, res: Response) => {
  try {
    const { technicianId } = parseParams(req, technicianIdParamSchema, 'technician ID');
    const availability = technicianService.getAvailability(technicianId);
    return sendSuccess(res, 200, 'Technician availability retrieved successfully', availability);
  } catch (error) {
    if (error instanceof ApiError) {
      return sendError(res, error.statusCode, error.message, error.errors);
    }

    return sendError(res, 500, 'Unexpected server error', ['An unexpected error occurred']);
  }
};

export const upsertTechnicianAvailabilityController = async (req: Request, res: Response) => {
  try {
    const { technicianId } = parseParams(req, technicianIdParamSchema, 'technician ID');
    const payload = parseBody(req, upsertAvailabilitySchema, 'availability');
    const availability = technicianService.upsertAvailability(technicianId, payload);
    return sendSuccess(res, 200, 'Technician availability updated successfully', availability);
  } catch (error) {
    if (error instanceof ApiError) {
      return sendError(res, error.statusCode, error.message, error.errors);
    }

    return sendError(res, 500, 'Unexpected server error', ['An unexpected error occurred']);
  }
};

export const getTechnicianPortfolioController = async (req: Request, res: Response) => {
  try {
    const { technicianId } = parseParams(req, technicianIdParamSchema, 'technician ID');
    const portfolio = technicianService.getPortfolio(technicianId);
    return sendSuccess(res, 200, 'Technician portfolio retrieved successfully', portfolio);
  } catch (error) {
    if (error instanceof ApiError) {
      return sendError(res, error.statusCode, error.message, error.errors);
    }

    return sendError(res, 500, 'Unexpected server error', ['An unexpected error occurred']);
  }
};

export const addTechnicianPortfolioItemController = async (req: Request, res: Response) => {
  try {
    const { technicianId } = parseParams(req, technicianIdParamSchema, 'technician ID');
    const payload = parseBody(req, addPortfolioItemSchema, 'portfolio item');
    const item = technicianService.addPortfolioItem(technicianId, payload);
    return sendSuccess(res, 201, 'Portfolio item added successfully', item);
  } catch (error) {
    if (error instanceof ApiError) {
      return sendError(res, error.statusCode, error.message, error.errors);
    }

    return sendError(res, 500, 'Unexpected server error', ['An unexpected error occurred']);
  }
};

export const updateTechnicianPortfolioItemController = async (req: Request, res: Response) => {
  try {
    const { technicianId, portfolioId } = parseParams(req, z.object({ technicianId: z.string().trim().min(1), portfolioId: z.string().trim().min(1) }), 'portfolio ID');
    const payload = parseBody(req, updatePortfolioItemSchema, 'portfolio item update');
    const item = technicianService.updatePortfolioItem(technicianId, portfolioId, payload);
    return sendSuccess(res, 200, 'Portfolio item updated successfully', item);
  } catch (error) {
    if (error instanceof ApiError) {
      return sendError(res, error.statusCode, error.message, error.errors);
    }

    return sendError(res, 500, 'Unexpected server error', ['An unexpected error occurred']);
  }
};

export const deleteTechnicianPortfolioItemController = async (req: Request, res: Response) => {
  try {
    const { technicianId, portfolioId } = parseParams(req, z.object({ technicianId: z.string().trim().min(1), portfolioId: z.string().trim().min(1) }), 'portfolio ID');
    const profile = technicianService.deletePortfolioItem(technicianId, portfolioId);
    return sendSuccess(res, 200, 'Portfolio item removed successfully', profile);
  } catch (error) {
    if (error instanceof ApiError) {
      return sendError(res, error.statusCode, error.message, error.errors);
    }

    return sendError(res, 500, 'Unexpected server error', ['An unexpected error occurred']);
  }
};

export const getTechnicianImpactSummaryController = async (req: Request, res: Response) => {
  try {
    const { technicianId } = parseParams(req, technicianIdParamSchema, 'technician ID');
    const impact = technicianService.getImpactSummary(technicianId);
    return sendSuccess(res, 200, 'Technician impact summary retrieved successfully', impact);
  } catch (error) {
    if (error instanceof ApiError) {
      return sendError(res, error.statusCode, error.message, error.errors);
    }

    return sendError(res, 500, 'Unexpected server error', ['An unexpected error occurred']);
  }
};

export const getPublicTechnicianProfileController = async (req: Request, res: Response) => {
  try {
    const { technicianId } = parseParams(req, technicianIdParamSchema, 'technician ID');
    const profile = technicianService.getPublicProfile(technicianId);
    return sendSuccess(res, 200, 'Public technician profile retrieved successfully', profile);
  } catch (error) {
    if (error instanceof ApiError) {
      return sendError(res, error.statusCode, error.message, error.errors);
    }

    return sendError(res, 500, 'Unexpected server error', ['An unexpected error occurred']);
  }
};
