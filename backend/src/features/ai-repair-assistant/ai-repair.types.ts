export type RepairUrgency = 'low' | 'medium' | 'high' | 'emergency';

export type AiRepairAssessment = {
  answer: string;
  issueCategory: string;
  urgency: RepairUrgency;
  recommendedSkills: string[];
  safetyWarning: string | null;
  followUpQuestions: string[];
};

export type MatchedTechnician = {
  technicianId: string;
  businessName: string;
  serviceArea: string;
  profilePhotoUrl?: string;
  averageRating: number;
  matchedSkills: string[];
};

export type AiRepairResponse = {
  assessment: AiRepairAssessment;
  matchedTechnicians: MatchedTechnician[];
};
