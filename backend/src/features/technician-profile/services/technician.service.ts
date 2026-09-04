import { ApiError } from '../shared/api-response';
import { technicianRepository } from '../repositories/technician.repository';
import {
  AvailabilityItem,
  CategoryItem,
  PortfolioItem,
  ServiceItem,
  SkillItem,
  TechnicianDiscoveryFilters,
  TechnicianProfile,
  TechnicianPublicProfile,
} from '../models/technician.types';

const ensureTechnicianExists = (technicianId: string) => {
  const profile = technicianRepository.getById(technicianId);
  if (!profile) {
    throw new ApiError(404, 'Technician not found', ['Technician ID not found']);
  }

  return profile;
};

type TechnicianProfileUpdate = Omit<
  Partial<TechnicianProfile>,
  'trust' | 'impact'
> & {
  trust?: Partial<TechnicianProfile['trust']>;
  impact?: Partial<TechnicianProfile['impact']>;
};

export const technicianService = {
  listTechnicians(filters: TechnicianDiscoveryFilters) {
    return technicianRepository.list(filters);
  },

  createProfile(profileInput: Omit<TechnicianProfile, 'skills' | 'supportedDeviceCategories' | 'services' | 'availability' | 'portfolio' | 'createdAt' | 'updatedAt'> & {
    skills?: SkillItem[];
    supportedDeviceCategories?: CategoryItem[];
    services?: ServiceItem[];
    availability?: AvailabilityItem[];
    portfolio?: PortfolioItem[];
  }) {
    const existing = technicianRepository.getById(profileInput.technicianId);
    if (existing) {
      throw new ApiError(409, 'Technician profile already exists', ['A technician profile already exists for this ID']);
    }

    return technicianRepository.create(profileInput);
  },

  getProfileById(technicianId: string) {
    return ensureTechnicianExists(technicianId);
  },

  updateProfile(
    technicianId: string,
    updates: TechnicianProfileUpdate,
  ) {
    const profile = ensureTechnicianExists(technicianId);
    const mergedUpdate = {
      ...profile,
      ...updates,
      trust: updates.trust ? { ...profile.trust, ...updates.trust } : profile.trust,
      impact: updates.impact ? { ...profile.impact, ...updates.impact } : profile.impact,
    };

    const updated = technicianRepository.update(technicianId, mergedUpdate);

    if (!updated) {
      throw new ApiError(404, 'Technician not found', ['Technician ID not found']);
    }

    return updated;
  },

  addSkill(technicianId: string, name: string) {
    ensureTechnicianExists(technicianId);
    const profile = technicianRepository.addSkill(technicianId, name);
    if (!profile) {
      throw new ApiError(404, 'Technician not found', ['Technician ID not found']);
    }

    return profile.skills.at(-1);
  },

  removeSkill(technicianId: string, skillId: string) {
    ensureTechnicianExists(technicianId);
    const profile = technicianRepository.removeSkill(technicianId, skillId);
    if (!profile) {
      throw new ApiError(404, 'Technician not found', ['Technician ID not found']);
    }

    return profile;
  },

  getSkills(technicianId: string) {
    const profile = ensureTechnicianExists(technicianId);
    return profile.skills;
  },

  addCategory(technicianId: string, name: string) {
    ensureTechnicianExists(technicianId);
    const profile = technicianRepository.addCategory(technicianId, name);
    if (!profile) {
      throw new ApiError(404, 'Technician not found', ['Technician ID not found']);
    }

    return profile.supportedDeviceCategories.at(-1);
  },

  removeCategory(technicianId: string, categoryId: string) {
    ensureTechnicianExists(technicianId);
    const profile = technicianRepository.removeCategory(technicianId, categoryId);
    if (!profile) {
      throw new ApiError(404, 'Technician not found', ['Technician ID not found']);
    }

    return profile;
  },

  getCategories(technicianId: string) {
    const profile = ensureTechnicianExists(technicianId);
    return profile.supportedDeviceCategories;
  },

  addService(technicianId: string, service: Omit<ServiceItem, 'id'>) {
    ensureTechnicianExists(technicianId);
    const profile = technicianRepository.addService(technicianId, service);
    if (!profile) {
      throw new ApiError(404, 'Technician not found', ['Technician ID not found']);
    }

    return profile.services.at(-1);
  },

  updateService(technicianId: string, serviceId: string, updates: Partial<Omit<ServiceItem, 'id'>>) {
    ensureTechnicianExists(technicianId);
    const profile = technicianRepository.updateService(technicianId, serviceId, updates);
    if (!profile) {
      throw new ApiError(404, 'Technician not found', ['Technician ID not found']);
    }

    return profile.services.find((service) => service.id === serviceId);
  },

  deleteService(technicianId: string, serviceId: string) {
    ensureTechnicianExists(technicianId);
    const profile = technicianRepository.removeService(technicianId, serviceId);
    if (!profile) {
      throw new ApiError(404, 'Technician not found', ['Technician ID not found']);
    }

    return profile;
  },

  getServices(technicianId: string) {
    const profile = ensureTechnicianExists(technicianId);
    return profile.services;
  },

  upsertAvailability(technicianId: string, availabilityInput: Omit<AvailabilityItem, 'id'>) {
    ensureTechnicianExists(technicianId);
    const profile = technicianRepository.upsertAvailability(technicianId, availabilityInput);
    if (!profile) {
      throw new ApiError(404, 'Technician not found', ['Technician ID not found']);
    }

    return profile.availability.find(
      (slot) => slot.day.toLowerCase() === availabilityInput.day.toLowerCase(),
    );
  },

  getAvailability(technicianId: string) {
    const profile = ensureTechnicianExists(technicianId);
    return profile.availability;
  },

  addPortfolioItem(technicianId: string, item: Omit<PortfolioItem, 'id'>) {
    ensureTechnicianExists(technicianId);
    const profile = technicianRepository.addPortfolioItem(technicianId, item);
    if (!profile) {
      throw new ApiError(404, 'Technician not found', ['Technician ID not found']);
    }

    return profile.portfolio.at(-1);
  },

  updatePortfolioItem(technicianId: string, portfolioId: string, item: Partial<Omit<PortfolioItem, 'id'>>) {
    ensureTechnicianExists(technicianId);
    const profile = technicianRepository.updatePortfolioItem(technicianId, portfolioId, item);
    if (!profile) {
      throw new ApiError(404, 'Technician not found', ['Technician ID not found']);
    }

    return profile.portfolio.find((portfolioItem) => portfolioItem.id === portfolioId);
  },

  deletePortfolioItem(technicianId: string, portfolioId: string) {
    ensureTechnicianExists(technicianId);
    const profile = technicianRepository.removePortfolioItem(technicianId, portfolioId);
    if (!profile) {
      throw new ApiError(404, 'Technician not found', ['Technician ID not found']);
    }

    return profile;
  },

  getPortfolio(technicianId: string) {
    const profile = ensureTechnicianExists(technicianId);
    return profile.portfolio;
  },

  getImpactSummary(technicianId: string) {
    const profile = ensureTechnicianExists(technicianId);
    return profile.impact;
  },

  getPublicProfile(technicianId: string): TechnicianPublicProfile {
    const publicProfile = technicianRepository.getPublicProfile(technicianId);
    if (!publicProfile) {
      throw new ApiError(404, 'Technician not found', ['Technician ID not found']);
    }

    return publicProfile;
  },
};
