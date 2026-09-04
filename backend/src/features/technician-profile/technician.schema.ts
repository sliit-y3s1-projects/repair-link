import { z } from 'zod';

const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const technicianIdSchema = z
  .string()
  .trim()
  .min(1, 'Technician ID cannot be empty')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Technician ID contains invalid characters');

export const createTechnicianProfileSchema = z.object({
  technicianId: technicianIdSchema,
  profilePhotoUrl: z.union([z.string().trim().url('Profile photo URL must be a valid URL'), z.literal('')]).optional(),
  businessName: z.string().trim().min(1, 'Business name cannot be empty'),
  bio: z.string().trim().max(2000, 'Bio is too long').optional(),
  serviceArea: z.string().trim().min(1, 'Service area/location cannot be empty'),
  yearsExperience: z.coerce.number().int('Years of experience must be an integer').nonnegative('Years of experience cannot be negative'),
  qualifications: z.array(z.string().trim().min(1, 'Qualification cannot be empty')).default([]),
  trust: z.object({
    averageRating: z.coerce.number().min(0).max(5).default(0),
    totalReviews: z.coerce.number().int().nonnegative().default(0),
    completedJobsCount: z.coerce.number().int().nonnegative().default(0),
    responseRate: z.coerce.number().min(0).max(100).default(0),
  }).default({
    averageRating: 0,
    totalReviews: 0,
    completedJobsCount: 0,
    responseRate: 0,
  }),
  impact: z.object({
    impactPoints: z.coerce.number().int().nonnegative().default(0),
    sustainabilityLevel: z.string().trim().min(1, 'Sustainability level cannot be empty').default('Bronze'),
  }).default({
    impactPoints: 0,
    sustainabilityLevel: 'Bronze',
  }),
});

export const updateTechnicianProfileSchema = z.object({
  profilePhotoUrl: z.union([z.string().trim().url('Profile photo URL must be a valid URL'), z.literal('')]).optional(),
  businessName: z.string().trim().min(1, 'Business name cannot be empty').optional(),
  bio: z.string().trim().max(2000, 'Bio is too long').optional(),
  serviceArea: z.string().trim().min(1, 'Service area/location cannot be empty').optional(),
  yearsExperience: z.coerce.number().int('Years of experience must be an integer').nonnegative('Years of experience cannot be negative').optional(),
  qualifications: z.array(z.string().trim().min(1, 'Qualification cannot be empty')).optional(),
  trust: z.object({
    averageRating: z.coerce.number().min(0).max(5),
    totalReviews: z.coerce.number().int().nonnegative(),
    completedJobsCount: z.coerce.number().int().nonnegative(),
    responseRate: z.coerce.number().min(0).max(100),
  }).partial().optional(),
  impact: z.object({
    impactPoints: z.coerce.number().int().nonnegative(),
    sustainabilityLevel: z.string().trim().min(1, 'Sustainability level cannot be empty'),
  }).partial().optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field must be provided for update',
});

export const addSkillSchema = z.object({
  name: z.string().trim().min(1, 'Skill value cannot be empty'),
});

export const addCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category value cannot be empty'),
});

export const addServiceSchema = z.object({
  name: z.string().trim().min(1, 'Service name cannot be empty'),
  description: z.string().trim().min(1, 'Service description cannot be empty'),
  minPrice: z.coerce.number().nonnegative('Prices cannot be negative'),
  maxPrice: z.coerce.number().nonnegative('Prices cannot be negative'),
}).refine((service) => service.maxPrice >= service.minPrice, {
  message: 'Minimum price cannot exceed maximum price',
  path: ['maxPrice'],
});

export const updateServiceSchema = z.object({
  name: z.string().trim().min(1, 'Service name cannot be empty').optional(),
  description: z.string().trim().min(1, 'Service description cannot be empty').optional(),
  minPrice: z.coerce.number().nonnegative('Prices cannot be negative').optional(),
  maxPrice: z.coerce.number().nonnegative('Prices cannot be negative').optional(),
}).refine((service) => {
  if (service.minPrice === undefined || service.maxPrice === undefined) {
    return true;
  }

  return service.maxPrice >= service.minPrice;
}, {
  message: 'Minimum price cannot exceed maximum price',
  path: ['maxPrice'],
});

export const upsertAvailabilitySchema = z.object({
  day: z.enum(validDays, {
    message: 'Working day must be valid',
  }),
  startTime: z.string().trim().regex(timeRegex, 'Start time must be in HH:MM format'),
  endTime: z.string().trim().regex(timeRegex, 'End time must be in HH:MM format'),
  status: z.enum(['available', 'unavailable'], {
    message: 'Availability status must be available or unavailable',
  }),
}).refine((availability) => {
  const [startHour, startMinute] = availability.startTime.split(':').map(Number);
  const [endHour, endMinute] = availability.endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  return endMinutes > startMinutes;
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const addPortfolioItemSchema = z.object({
  imageUrl: z.string().trim().url('Image URL must be a valid URL'),
  deviceCategory: z.string().trim().min(1, 'Portfolio device/category cannot be empty'),
  title: z.string().trim().min(1, 'Portfolio title cannot be empty'),
  shortDescription: z.string().trim().min(1, 'Portfolio description cannot be empty'),
  completionDate: z.string().trim().min(1, 'Completion date cannot be empty'),
});

export const updatePortfolioItemSchema = z.object({
  imageUrl: z.string().trim().url('Image URL must be a valid URL').optional(),
  deviceCategory: z.string().trim().min(1, 'Portfolio device/category cannot be empty').optional(),
  title: z.string().trim().min(1, 'Portfolio title cannot be empty').optional(),
  shortDescription: z.string().trim().min(1, 'Portfolio description cannot be empty').optional(),
  completionDate: z.string().trim().min(1, 'Completion date cannot be empty').optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one portfolio field must be provided for update',
});

export const queryFiltersSchema = z.object({
  skill: z.string().trim().optional(),
  category: z.string().trim().optional(),
  location: z.string().trim().optional(),
  available: z.enum(['true', 'false']).optional().transform((value) => value === 'true'),
});

export const technicianIdParamSchema = z.object({
  technicianId: technicianIdSchema,
});

export const skillIdParamSchema = z.object({
  technicianId: technicianIdSchema,
  skillId: z.string().trim().min(1, 'Skill ID cannot be empty'),
});

export const categoryIdParamSchema = z.object({
  technicianId: technicianIdSchema,
  categoryId: z.string().trim().min(1, 'Category ID cannot be empty'),
});

export const serviceIdParamSchema = z.object({
  technicianId: technicianIdSchema,
  serviceId: z.string().trim().min(1, 'Service ID cannot be empty'),
});

export const portfolioIdParamSchema = z.object({
  technicianId: technicianIdSchema,
  portfolioId: z.string().trim().min(1, 'Portfolio ID cannot be empty'),
});
