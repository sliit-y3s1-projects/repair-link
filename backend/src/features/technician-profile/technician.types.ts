export type TechnicianId = string;

export type SkillItem = {
  id: string;
  name: string;
};

export type CategoryItem = {
  id: string;
  name: string;
};

export type ServiceItem = {
  id: string;
  name: string;
  description: string;
  minPrice: number;
  maxPrice: number;
};

export type AvailabilityStatus = 'available' | 'unavailable';

export type AvailabilityItem = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  status: AvailabilityStatus;
};

export type PortfolioItem = {
  id: string;
  imageUrl: string;
  deviceCategory: string;
  title: string;
  shortDescription: string;
  completionDate: string;
};

export type TechnicianTrustSummary = {
  averageRating: number;
  totalReviews: number;
  completedJobsCount: number;
  responseRate: number;
};

export type EnvironmentalImpactSummary = {
  impactPoints: number;
  sustainabilityLevel: string;
};

export type TechnicianProfile = {
  technicianId: TechnicianId;
  profilePhotoUrl?: string;
  businessName: string;
  bio?: string;
  serviceArea: string;
  yearsExperience: number;
  qualifications: string[];
  skills: SkillItem[];
  supportedDeviceCategories: CategoryItem[];
  services: ServiceItem[];
  availability: AvailabilityItem[];
  portfolio: PortfolioItem[];
  trust: TechnicianTrustSummary;
  impact: EnvironmentalImpactSummary;
  createdAt: string;
  updatedAt: string;
};

export type TechnicianPublicProfile = {
  technicianId: TechnicianId;
  profilePhotoUrl?: string;
  businessName: string;
  bio?: string;
  serviceArea: string;
  yearsExperience: number;
  qualifications: string[];
  skills: string[];
  supportedDeviceCategories: string[];
  services: ServiceItem[];
  availability: AvailabilityItem[];
  portfolio: PortfolioItem[];
  averageRating: number;
  totalReviews: number;
  completedJobsCount: number;
  responseRate: number;
  impactPoints: number;
  sustainabilityLevel: string;
};

export type TechnicianDiscoveryFilters = {
  skill?: string;
  category?: string;
  location?: string;
  available?: boolean;
};
