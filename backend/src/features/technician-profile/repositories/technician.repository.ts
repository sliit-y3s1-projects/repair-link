import {
  AvailabilityItem,
  CategoryItem,
  EnvironmentalImpactSummary,
  PortfolioItem,
  ServiceItem,
  SkillItem,
  TechnicianDiscoveryFilters,
  TechnicianProfile,
  TechnicianPublicProfile,
  TechnicianTrustSummary,
} from '../models/technician.types';

const technicians = new Map<string, TechnicianProfile>();

const toSlug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const defaultTrust = (): TechnicianTrustSummary => ({
  averageRating: 0,
  totalReviews: 0,
  completedJobsCount: 0,
  responseRate: 0,
});

const defaultImpact = (): EnvironmentalImpactSummary => ({
  impactPoints: 0,
  sustainabilityLevel: 'Bronze',
});

export const technicianRepository = {
  list(filter: TechnicianDiscoveryFilters = {}) {
    let profiles = Array.from(technicians.values());

    if (filter.skill) {
      const skillSlug = toSlug(filter.skill);
      profiles = profiles.filter((profile) =>
        profile.skills.some((skill) => toSlug(skill.name) === skillSlug),
      );
    }

    if (filter.category) {
      const categorySlug = toSlug(filter.category);
      profiles = profiles.filter((profile) =>
        profile.supportedDeviceCategories.some(
          (category) => toSlug(category.name) === categorySlug,
        ),
      );
    }

    if (filter.location) {
      const locationSlug = toSlug(filter.location);
      profiles = profiles.filter((profile) =>
        toSlug(profile.serviceArea).includes(locationSlug),
      );
    }

    if (filter.available !== undefined) {
      profiles = profiles.filter((profile) => {
        const isAvailable = profile.availability.some(
          (slot) => slot.status === 'available',
        );
        return filter.available ? isAvailable : !isAvailable;
      });
    }

    return profiles.map((profile) => ({
      technicianId: profile.technicianId,
      businessName: profile.businessName,
      serviceArea: profile.serviceArea,
      yearsExperience: profile.yearsExperience,
      profilePhotoUrl: profile.profilePhotoUrl,
      trust: profile.trust,
      impact: profile.impact,
      skills: profile.skills,
      supportedDeviceCategories: profile.supportedDeviceCategories,
      availability: profile.availability,
    }));
  },

  getById(technicianId: string) {
    return technicians.get(technicianId);
  },

  create(profile: Omit<TechnicianProfile, 'createdAt' | 'updatedAt' | 'skills' | 'supportedDeviceCategories' | 'services' | 'availability' | 'portfolio'> & {
    skills?: SkillItem[];
    supportedDeviceCategories?: CategoryItem[];
    services?: ServiceItem[];
    availability?: AvailabilityItem[];
    portfolio?: PortfolioItem[];
  }) {
    const now = new Date().toISOString();
    const record: TechnicianProfile = {
      ...profile,
      skills: profile.skills ?? [],
      supportedDeviceCategories: profile.supportedDeviceCategories ?? [],
      services: profile.services ?? [],
      availability: profile.availability ?? [],
      portfolio: profile.portfolio ?? [],
      createdAt: now,
      updatedAt: now,
      trust: profile.trust ?? defaultTrust(),
      impact: profile.impact ?? defaultImpact(),
      qualifications: profile.qualifications ?? [],
    };

    technicians.set(record.technicianId, record);
    return record;
  },

  update(technicianId: string, updates: Partial<TechnicianProfile>) {
    const existing = technicians.get(technicianId);
    if (!existing) {
      return undefined;
    }

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    technicians.set(technicianId, updated);
    return updated;
  },

  addSkill(technicianId: string, name: string) {
    const existing = technicians.get(technicianId);
    if (!existing) {
      return undefined;
    }

    const isDuplicate = existing.skills.some(
      (skill) => skill.name.toLowerCase() === name.toLowerCase(),
    );

    if (isDuplicate) {
      return existing;
    }

    const skill: SkillItem = {
      id: createId('skill'),
      name,
    };

    existing.skills.push(skill);
    existing.updatedAt = new Date().toISOString();
    technicians.set(technicianId, existing);
    return existing;
  },

  removeSkill(technicianId: string, skillId: string) {
    const existing = technicians.get(technicianId);
    if (!existing) {
      return undefined;
    }

    existing.skills = existing.skills.filter((skill) => skill.id !== skillId);
    existing.updatedAt = new Date().toISOString();
    technicians.set(technicianId, existing);
    return existing;
  },

  addCategory(technicianId: string, name: string) {
    const existing = technicians.get(technicianId);
    if (!existing) {
      return undefined;
    }

    const isDuplicate = existing.supportedDeviceCategories.some(
      (category) => category.name.toLowerCase() === name.toLowerCase(),
    );

    if (isDuplicate) {
      return existing;
    }

    const category: CategoryItem = {
      id: createId('category'),
      name,
    };

    existing.supportedDeviceCategories.push(category);
    existing.updatedAt = new Date().toISOString();
    technicians.set(technicianId, existing);
    return existing;
  },

  removeCategory(technicianId: string, categoryId: string) {
    const existing = technicians.get(technicianId);
    if (!existing) {
      return undefined;
    }

    existing.supportedDeviceCategories = existing.supportedDeviceCategories.filter(
      (category) => category.id !== categoryId,
    );
    existing.updatedAt = new Date().toISOString();
    technicians.set(technicianId, existing);
    return existing;
  },

  addService(technicianId: string, service: Omit<ServiceItem, 'id'>) {
    const existing = technicians.get(technicianId);
    if (!existing) {
      return undefined;
    }

    const item: ServiceItem = {
      id: createId('service'),
      ...service,
    };

    existing.services.push(item);
    existing.updatedAt = new Date().toISOString();
    technicians.set(technicianId, existing);
    return existing;
  },

  updateService(technicianId: string, serviceId: string, updates: Partial<Omit<ServiceItem, 'id'>>) {
    const existing = technicians.get(technicianId);
    if (!existing) {
      return undefined;
    }

    existing.services = existing.services.map((service) => {
      if (service.id !== serviceId) {
        return service;
      }

      return {
        ...service,
        ...updates,
      };
    });
    existing.updatedAt = new Date().toISOString();
    technicians.set(technicianId, existing);
    return existing;
  },

  removeService(technicianId: string, serviceId: string) {
    const existing = technicians.get(technicianId);
    if (!existing) {
      return undefined;
    }

    existing.services = existing.services.filter((service) => service.id !== serviceId);
    existing.updatedAt = new Date().toISOString();
    technicians.set(technicianId, existing);
    return existing;
  },

  upsertAvailability(technicianId: string, availability: Omit<AvailabilityItem, 'id'>) {
    const existing = technicians.get(technicianId);
    if (!existing) {
      return undefined;
    }

    const existingAvailability = existing.availability.find(
      (slot) => slot.day.toLowerCase() === availability.day.toLowerCase(),
    );

    if (existingAvailability) {
      Object.assign(existingAvailability, availability);
    } else {
      existing.availability.push({
        id: createId('availability'),
        ...availability,
      });
    }

    existing.updatedAt = new Date().toISOString();
    technicians.set(technicianId, existing);
    return existing;
  },

  addPortfolioItem(technicianId: string, item: Omit<PortfolioItem, 'id'>) {
    const existing = technicians.get(technicianId);
    if (!existing) {
      return undefined;
    }

    const portfolioItem: PortfolioItem = {
      id: createId('portfolio'),
      ...item,
    };

    existing.portfolio.push(portfolioItem);
    existing.updatedAt = new Date().toISOString();
    technicians.set(technicianId, existing);
    return existing;
  },

  updatePortfolioItem(technicianId: string, portfolioId: string, updates: Partial<Omit<PortfolioItem, 'id'>>) {
    const existing = technicians.get(technicianId);
    if (!existing) {
      return undefined;
    }

    existing.portfolio = existing.portfolio.map((item) => {
      if (item.id !== portfolioId) {
        return item;
      }

      return {
        ...item,
        ...updates,
      };
    });
    existing.updatedAt = new Date().toISOString();
    technicians.set(technicianId, existing);
    return existing;
  },

  removePortfolioItem(technicianId: string, portfolioId: string) {
    const existing = technicians.get(technicianId);
    if (!existing) {
      return undefined;
    }

    existing.portfolio = existing.portfolio.filter((item) => item.id !== portfolioId);
    existing.updatedAt = new Date().toISOString();
    technicians.set(technicianId, existing);
    return existing;
  },

  getImpactSummary(technicianId: string) {
    const existing = technicians.get(technicianId);
    if (!existing) {
      return undefined;
    }

    return existing.impact;
  },

  getPublicProfile(technicianId: string): TechnicianPublicProfile | undefined {
    const existing = technicians.get(technicianId);
    if (!existing) {
      return undefined;
    }

    return {
      technicianId: existing.technicianId,
      profilePhotoUrl: existing.profilePhotoUrl,
      businessName: existing.businessName,
      bio: existing.bio,
      serviceArea: existing.serviceArea,
      yearsExperience: existing.yearsExperience,
      qualifications: existing.qualifications,
      skills: existing.skills.map((skill) => skill.name),
      supportedDeviceCategories: existing.supportedDeviceCategories.map((category) => category.name),
      services: existing.services,
      availability: existing.availability,
      portfolio: existing.portfolio,
      averageRating: existing.trust.averageRating,
      totalReviews: existing.trust.totalReviews,
      completedJobsCount: existing.trust.completedJobsCount,
      responseRate: existing.trust.responseRate,
      impactPoints: existing.impact.impactPoints,
      sustainabilityLevel: existing.impact.sustainabilityLevel,
    };
  },
};

export const technicianStore = technicians;
