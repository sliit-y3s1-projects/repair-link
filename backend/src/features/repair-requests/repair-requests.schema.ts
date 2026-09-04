import { z } from 'zod';

export const repairStatusEnum = z.enum([
  'requested',
  'quoted',
  'booked',
  'in_progress',
  'waiting_for_parts',
  'completed',
  'cancelled',
  'disputed',
]);

export const preferredRepairMethodEnum = z.enum([
  'carry_in',
  'pickup',
  'on_site',
  'mail_in',
]);

export const supportedImageMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;

// Max 10MB per uploaded photo
export const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024;

// Photo metadata stored in the database representing object storage references
export const PhotoMetadataSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, 'Photo object key is required')
    .max(500, 'Photo object key is too long'),
  fileName: z
    .string()
    .trim()
    .min(1, 'File name is required')
    .max(255, 'File name is too long'),
  fileType: z.enum(supportedImageMimeTypes, {
    message: 'Unsupported photo format. Supported formats: JPEG, PNG, WEBP, HEIC',
  }),
  fileSize: z
    .number()
    .int('File size must be an integer')
    .positive('File size must be greater than zero')
    .max(MAX_PHOTO_SIZE_BYTES, 'Photo file size exceeds maximum limit of 10MB'),
  url: z.string().trim().url('Photo URL must be a valid URL').optional(),
  uploadedAt: z.string().datetime({ offset: true }).optional(),
});

// Schema for requesting pre-signed object storage upload URL
export const PresignPhotoUploadSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, 'File name is required')
    .max(255, 'File name is too long'),
  fileType: z.enum(supportedImageMimeTypes, {
    message: 'Unsupported photo format. Supported formats: JPEG, PNG, WEBP, HEIC',
  }),
  fileSize: z
    .number()
    .int()
    .positive('File size must be greater than zero')
    .max(MAX_PHOTO_SIZE_BYTES, 'Photo file size exceeds maximum limit of 10MB'),
});

// Consumer creates repair request
export const CreateRepairRequestSchema = z.object({
  deviceCategory: z
    .string()
    .trim()
    .min(1, 'Device category cannot be empty')
    .max(100, 'Device category is too long'),
  deviceBrand: z
    .string()
    .trim()
    .min(1, 'Device brand cannot be empty')
    .max(100, 'Device brand is too long'),
  deviceModel: z
    .string()
    .trim()
    .min(1, 'Device model cannot be empty')
    .max(100, 'Device model is too long'),
  issueDescription: z
    .string()
    .trim()
    .min(10, 'Issue description must be at least 10 characters')
    .max(3000, 'Issue description cannot exceed 3000 characters'),
  photos: z
    .array(PhotoMetadataSchema)
    .max(10, 'A maximum of 10 photos can be attached per repair request')
    .default([]),
  preferredRepairMethod: preferredRepairMethodEnum,
  approximateLocation: z
    .string()
    .trim()
    .min(2, 'Approximate location cannot be empty')
    .max(255, 'Approximate location is too long'),
  preferredTime: z
    .string()
    .trim()
    .min(2, 'Preferred time cannot be empty')
    .max(255, 'Preferred time description is too long'),
  budget: z
    .coerce
    .number()
    .positive('Budget must be a positive number')
    .optional(),
  contactPhone: z
    .string()
    .trim()
    .min(8, 'Contact phone number must be at least 8 digits')
    .max(20, 'Contact phone number is too long')
    .optional(),
});

// Technician submits a quote
export const SubmitQuoteSchema = z.object({
  amount: z
    .coerce
    .number()
    .positive('Quote amount must be greater than zero'),
  currency: z
    .string()
    .trim()
    .min(3)
    .max(3)
    .default('LKR'),
  message: z
    .string()
    .trim()
    .max(2000, 'Quote message cannot exceed 2000 characters')
    .optional(),
  estimatedDurationHours: z
    .coerce
    .number()
    .positive('Estimated duration must be positive')
    .optional(),
});

// Consumer books a repair request by accepting a quote
export const BookRepairRequestSchema = z.object({
  quoteId: z
    .string()
    .trim()
    .min(1, 'Quote ID is required'),
  scheduledAt: z
    .string()
    .trim()
    .min(1, 'Scheduled time is required'),
  notes: z
    .string()
    .trim()
    .max(1000, 'Booking notes cannot exceed 1000 characters')
    .optional(),
});

// Work status update
export const UpdateRepairStatusSchema = z.object({
  status: repairStatusEnum,
  note: z
    .string()
    .trim()
    .max(1000, 'Status transition note cannot exceed 1000 characters')
    .optional(),
});

// Consumer cancels request
export const CancelRepairRequestSchema = z.object({
  reason: z
    .string()
    .trim()
    .max(1000, 'Cancellation reason cannot exceed 1000 characters')
    .optional(),
});

// Open dispute
export const OpenDisputeSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, 'Dispute reason must be at least 5 characters')
    .max(2000, 'Dispute reason cannot exceed 2000 characters'),
  evidence: z
    .array(z.string().trim())
    .optional(),
});

// Search filters
export const SearchRepairRequestsSchema = z.object({
  status: repairStatusEnum.optional(),
  category: z.string().trim().optional(),
  consumerId: z.string().trim().optional(),
  technicianId: z.string().trim().optional(),
  location: z.string().trim().optional(),
});

// Technician leads query
export const TechnicianLeadsQuerySchema = z.object({
  category: z.string().trim().optional(),
  location: z.string().trim().optional(),
});

export type CreateRepairRequestInput = z.infer<typeof CreateRepairRequestSchema>;
export type SubmitQuoteInput = z.infer<typeof SubmitQuoteSchema>;
export type BookRepairRequestInput = z.infer<typeof BookRepairRequestSchema>;
export type UpdateRepairStatusInput = z.infer<typeof UpdateRepairStatusSchema>;
export type CancelRepairRequestInput = z.infer<typeof CancelRepairRequestSchema>;
export type OpenDisputeInput = z.infer<typeof OpenDisputeSchema>;
export type SearchRepairRequestsQuery = z.infer<typeof SearchRepairRequestsSchema>;
export type PresignPhotoUploadInput = z.infer<typeof PresignPhotoUploadSchema>;

