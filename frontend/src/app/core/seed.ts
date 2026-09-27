import { Draft, EMPTY_SETTINGS, Project, Service, SiteSettings, Skill } from './models';

/** Contenu de départ du portfolio (importé en un clic depuis l'admin). */

const skill = (name: string, category: string, icon: string, order: number): Draft<Skill> => ({
  name,
  category,
  icon,
  visible: true,
  order,
});

export const SEED_SKILLS: Draft<Skill>[] = [
  skill('Angular', 'Frontend', 'angular', 1),
  skill('React', 'Frontend', 'react', 2),
  skill('TypeScript', 'Frontend', 'typescript', 3),
  skill('HTML / CSS / JS', 'Frontend', 'html5', 4),
  skill('Tailwind CSS', 'Frontend', 'tailwindcss', 5),
  skill('Spring Boot', 'Backend', 'spring', 1),
  skill('Java', 'Backend', 'java', 2),
  skill('Node.js', 'Backend', 'nodejs', 3),
  skill('Python', 'Backend', 'python', 4),
  skill('Django / FastAPI', 'Backend', 'django', 5),
  skill('Flutter', 'Mobile', 'flutter', 1),
  skill('React Native', 'Mobile', 'react', 2),
  skill('Android natif', 'Mobile', 'android', 3),
  skill('PWA', 'Mobile', '', 4),
  skill('PostgreSQL', 'Bases de données', 'postgresql', 1),
  skill('MySQL', 'Bases de données', 'mysql', 2),
  skill('Firebase', 'Bases de données', 'firebase', 3),
  skill('Git / GitHub', 'Outils & DevOps', 'git', 1),
  skill('Docker', 'Outils & DevOps', 'docker', 2),
  skill('Linux', 'Outils & DevOps', 'linux', 3),
  skill('Postman', 'Outils & DevOps', 'postman', 4),
  skill('Figma', 'Outils & DevOps', 'figma', 5),
  skill('VS Code', 'Outils & DevOps', 'vscode', 6),
  skill('IntelliJ IDEA', 'Outils & DevOps', 'intellij', 7),
  skill('FileZilla', 'Outils & DevOps', 'filezilla', 8),
  skill('Intelligence artificielle', 'En apprentissage', '', 1),
  skill('Next.js', 'En apprentissage', 'nextjs', 2),
  skill('Électronique', 'En apprentissage', '', 3),
];

export const SEED_SERVICES: Draft<Service>[] = [
  { title: 'Applications web sur mesure', description: 'Outils métier, tableaux de bord et plateformes pensés pour votre activité.', icon: 'web', visible: true, order: 1 },
  { title: 'API & backend', description: 'Des API REST solides et sécurisées, des microservices prêts à grandir.', icon: 'api', visible: true, order: 2 },
  { title: 'Applications mobiles', description: 'Android et iOS avec Flutter, React Native ou en natif.', icon: 'mobile', visible: true, order: 3 },
  { title: 'Progressive Web Apps', description: 'Un site qui s’installe comme une app, marche hors ligne et envoie des notifications.', icon: 'pwa', visible: true, order: 4 },
  { title: 'Conception d’applications', description: 'De l’idée à la réalisation : maquette, développement, tests et mise en ligne.', icon: 'idea', visible: true, order: 5 },
  { title: 'Maintenance & déploiement', description: 'Correction de bugs, évolutions, mise en ligne et suivi de vos applications.', icon: 'tools', visible: true, order: 6 },
];

export const SEED_PROJECTS: Draft<Project>[] = [
  { title: 'DÉPÊCHE 226', description: 'Site d’actualités sous-régionales.', category: 'Sites web', tech: [], repoUrl: '', demoUrl: '', status: 'termine', visible: true, order: 1 },
  { title: 'Club informatique de l’IST', description: 'Site web officiel du club informatique de l’IST.', category: 'Sites web', tech: [], repoUrl: '', demoUrl: '', status: 'termine', visible: true, order: 2 },
  { title: 'EDUTECH', description: 'Site e-commerce.', category: 'E-commerce', tech: [], repoUrl: '', demoUrl: '', status: 'en-cours', visible: true, order: 3 },
  { title: 'FASOGUARDIAN', description: 'SaaS.', category: 'SaaS', tech: [], repoUrl: '', demoUrl: '', status: 'en-cours', visible: true, order: 4 },
];

export const SEED_SETTINGS: SiteSettings = {
  ...EMPTY_SETTINGS,
  contacts: {
    email: 'pamoussop@gmail.com',
    whatsapp: '+226 55 63 37 24',
    linkedin: 'https://www.linkedin.com/in/prince-henri-junior-pamousso-37a804342',
    github: 'pamoussop-art',
  },
  yearsExperience: 2,
};
