/**
 * Modèles de données du portfolio.
 * Ce dossier « core » ne dépend ni d'Angular ni de Firebase :
 * il contient toute la logique métier et il est testé automatiquement.
 */

export interface Skill {
  id: string;
  name: string;
  /** Catégorie d'affichage : Frontend, Backend, Mobile, … */
  category: string;
  /** Nom Devicon du logo (ex. "angular"). Vide = initiales affichées. */
  icon: string;
  visible: boolean;
  order: number;
}

export type ProjectStatus = 'en-cours' | 'termine';

export interface Project {
  id: string;
  title: string;
  description: string;
  /** Catégorie utilisée par les filtres (ex. "Sites web", "E-commerce", "SaaS"). */
  category: string;
  /** Technologies utilisées : noms Devicon (logos affichés sur la carte). */
  tech: string[];
  repoUrl: string;
  demoUrl: string;
  status: ProjectStatus;
  visible: boolean;
  order: number;
}

export type ServiceIcon = 'web' | 'api' | 'mobile' | 'pwa' | 'idea' | 'tools';

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: ServiceIcon;
  visible: boolean;
  order: number;
}

export interface Contacts {
  email: string;
  whatsapp: string;
  linkedin: string;
  github: string;
}

export interface SiteSettings {
  cvUrl: string | null;
  cvFileName: string | null;
  cvPublicId: string | null;
  cvUpdatedAt: number | null;
  photoUrl: string | null;
  photoPublicId: string | null;
  photoUpdatedAt: number | null;
  contacts: Contacts;
  yearsExperience: number;
}

/** Données d'un élément sans son identifiant (création). */
export type Draft<T extends { id: string }> = Omit<T, 'id'>;

export const SKILL_CATEGORIES = [
  'Frontend',
  'Backend',
  'Mobile',
  'Bases de données',
  'Outils & DevOps',
  'En apprentissage',
] as const;

export const LEARNING_CATEGORY = 'En apprentissage';

export const SERVICE_ICONS: readonly ServiceIcon[] = ['web', 'api', 'mobile', 'pwa', 'idea', 'tools'];

export const EMPTY_SETTINGS: SiteSettings = {
  cvUrl: null,
  cvFileName: null,
  cvPublicId: null,
  cvUpdatedAt: null,
  photoUrl: null,
  photoPublicId: null,
  photoUpdatedAt: null,
  contacts: { email: '', whatsapp: '', linkedin: '', github: '' },
  yearsExperience: 2,
};
