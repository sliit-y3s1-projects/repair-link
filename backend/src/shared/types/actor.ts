export const actorRoles = ['consumer', 'technician', 'seller', 'admin'] as const;

export type ActorRole = (typeof actorRoles)[number];

/**
 * Temporary local-development identity. It is intentionally not authentication
 * and must be replaced by authenticated identity before deployment.
 */
export interface DevelopmentActor {
  id: string;
  name: string;
  role: ActorRole;
  storeName?: string;
}
