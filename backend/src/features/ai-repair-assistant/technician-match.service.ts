import { technicianRepository } from '../technician-profile/technician.repository';
import type { AiRepairAssessment, MatchedTechnician } from './ai-repair.types';

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export const technicianMatchService = {
  findMatches(assessment: AiRepairAssessment): MatchedTechnician[] {
    const desiredTerms = [assessment.issueCategory, ...assessment.recommendedSkills]
      .map(normalize)
      .filter(Boolean);

    return technicianRepository
      .list()
      .map((technician) => {
        const skills = [
          ...technician.skills.map((skill) => skill.name),
          ...technician.supportedDeviceCategories.map((category) => category.name),
        ];
        const matchedSkills = skills.filter((skill) => {
          const normalizedSkill = normalize(skill);
          return desiredTerms.some(
            (term) => normalizedSkill.includes(term) || term.includes(normalizedSkill),
          );
        });

        return { technician, matchedSkills };
      })
      .filter(({ matchedSkills }) => matchedSkills.length > 0)
      .sort((a, b) => {
        const scoreDifference = b.matchedSkills.length - a.matchedSkills.length;
        return scoreDifference || b.technician.trust.averageRating - a.technician.trust.averageRating;
      })
      .slice(0, 3)
      .map(({ technician, matchedSkills }) => ({
        technicianId: technician.technicianId,
        businessName: technician.businessName,
        serviceArea: technician.serviceArea,
        profilePhotoUrl: technician.profilePhotoUrl,
        averageRating: technician.trust.averageRating,
        matchedSkills,
      }));
  },
};
