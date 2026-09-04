export type RepairStatus =
  | 'requested'
  | 'quoted'
  | 'booked'
  | 'in_progress'
  | 'waiting_for_parts'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type PreferredRepairMethod = 'carry_in' | 'pickup' | 'on_site' | 'mail_in';

export interface PhotoMetadata {
  key: string;            // Object storage key (e.g. photos/requests/req_123/front_screen.jpg)
  fileName: string;       // Original file name
  fileType: string;       // MIME type: image/jpeg, image/png, image/webp
  fileSize: number;       // Size in bytes (max 10MB)
  url?: string;           // Optional pre-signed GET / CDN URL
  uploadedAt?: string;    // Timestamp of upload
}

export interface RepairStatusActor {
  id: string;
  name: string;
  role: 'consumer' | 'technician' | 'seller' | 'admin';
}

export interface RepairStatusHistory {
  id: string;
  repairRequestId: string;
  actor: RepairStatusActor;
  oldStatus: RepairStatus | null;
  newStatus: RepairStatus;
  note?: string;
  timestamp: string;      // Immutable timestamp
}

export interface RepairQuote {
  id: string;
  repairRequestId: string;
  technicianId: string;
  technicianName: string;
  technicianBusinessName?: string;
  amount: number;
  currency: string;
  message?: string;
  estimatedDurationHours?: number;
  status: 'sent' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface RepairBooking {
  id: string;
  repairRequestId: string;
  acceptedQuoteId: string;
  scheduledAt: string;
  technicianId: string;
  technicianName: string;
  notes?: string;
  createdAt: string;
}

export interface RepairRequest {
  id: string;
  consumerId: string;
  consumerName: string;
  consumerContactPhone?: string;
  deviceCategory: string;
  deviceBrand: string;
  deviceModel: string;
  issueDescription: string;
  photos: PhotoMetadata[];
  preferredRepairMethod: PreferredRepairMethod;
  approximateLocation: string; // E.g. "Colombo 03", "Kandy Town", "Galle Fort"
  preferredTime: string;        // E.g. "2026-09-10T10:00:00Z" or "Weekdays after 5 PM"
  budget?: number;             // In LKR (optional)
  status: RepairStatus;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  quotes: RepairQuote[];
  booking?: RepairBooking;
  createdAt: string;
  updatedAt: string;
}

export interface DevActor {
  id: string;
  name: string;
  role: 'consumer' | 'technician' | 'seller' | 'admin';
  serviceArea?: string;
  supportedCategories?: string[];
  storeName?: string;
}

export interface SearchRepairRequestsFilter {
  status?: RepairStatus;
  category?: string;
  consumerId?: string;
  technicianId?: string;
  location?: string;
}
