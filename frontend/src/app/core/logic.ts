import { Contacts, LEARNING_CATEGORY, Project, SKILL_CATEGORIES, Skill } from './models';

/** Initiales affichées quand un logo n'existe pas (ex. « Intelligence artificielle » → « IA »). */
export function monogram(name: string): string {
  const words = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export const byOrder = <T extends { order: number }>(a: T, b: T): number => a.order - b.order;

export interface SkillGroup {
  category: string;
  learning: boolean;
  skills: Skill[];
}

/** Regroupe les compétences visibles par catégorie, dans l'ordre d'affichage du site. */
export function groupSkills(skills: Skill[], includeHidden = false): SkillGroup[] {
  const map = new Map<string, Skill[]>();
  for (const s of skills) {
    if (!includeHidden && !s.visible) continue;
    const list = map.get(s.category) ?? [];
    list.push(s);
    map.set(s.category, list);
  }
  const known: string[] = SKILL_CATEGORIES.filter((c) => map.has(c));
  const extras = [...map.keys()]
    .filter((c) => !(SKILL_CATEGORIES as readonly string[]).includes(c))
    .sort((a, b) => a.localeCompare(b, 'fr'));
  // « En apprentissage » toujours en dernier.
  const ordered = [...known.filter((c) => c !== LEARNING_CATEGORY), ...extras];
  if (map.has(LEARNING_CATEGORY)) ordered.push(LEARNING_CATEGORY);
  return ordered.map((category) => ({
    category,
    learning: category === LEARNING_CATEGORY,
    skills: [...(map.get(category) ?? [])].sort(byOrder),
  }));
}

/** Toutes les catégories connues (fixes + celles créées par l'admin). */
export function allCategories(skills: Skill[]): string[] {
  const extra = skills
    .map((s) => s.category)
    .filter((c, i, arr) => arr.indexOf(c) === i && !(SKILL_CATEGORIES as readonly string[]).includes(c));
  return [...SKILL_CATEGORIES, ...extra];
}

export const PROJECT_FILTER_ALL = 'Tous';
export const PROJECT_FILTER_WIP = 'En cours';

export function visibleProjects(projects: Project[]): Project[] {
  return projects.filter((p) => p.visible).sort(byOrder);
}

/** Filtres proposés au-dessus des projets : Tous, puis les catégories, puis « En cours ». */
export function projectFilters(projects: Project[]): string[] {
  const visible = visibleProjects(projects);
  const cats = visible.map((p) => p.category).filter((c, i, a) => !!c && a.indexOf(c) === i);
  const filters = [PROJECT_FILTER_ALL, ...cats];
  if (visible.some((p) => p.status === 'en-cours')) filters.push(PROJECT_FILTER_WIP);
  return filters;
}

export function filterProjects(projects: Project[], filter: string): Project[] {
  const visible = visibleProjects(projects);
  if (filter === PROJECT_FILTER_ALL) return visible;
  if (filter === PROJECT_FILTER_WIP) return visible.filter((p) => p.status === 'en-cours');
  return visible.filter((p) => p.category === filter);
}

export interface PublicStats {
  projects: number;
  technologies: number;
  years: number;
}

export function computeStats(skills: Skill[], projects: Project[], years: number): PublicStats {
  return {
    projects: projects.filter((p) => p.visible).length,
    technologies: skills.filter((s) => s.visible && s.category !== LEARNING_CATEGORY).length,
    years,
  };
}

/** Lien WhatsApp cliquable (wa.me) à partir d'un numéro saisi librement. */
export function whatsappLink(number: string): string {
  const digits = number.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : '';
}

export function contactLinks(c: Contacts) {
  return {
    email: c.email ? `mailto:${c.email}` : '',
    whatsapp: whatsappLink(c.whatsapp),
    linkedin: c.linkedin,
    github: c.github ? `https://github.com/${c.github}` : '',
  };
}

/** Affichage court d'un lien LinkedIn (ex. « prince-henri-junior-pamousso »). */
export function linkedinHandle(url: string): string {
  const m = url.match(/linkedin\.com\/in\/([^/?#]+)/i);
  if (!m) return url.replace(/^https?:\/\/(www\.)?/i, '');
  return m[1].replace(/-[0-9a-f]{6,}$/i, '');
}

export const DEVICON_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';

/** Variantes utilisées quand « -original » n'existe pas pour une technologie. */
const DEVICON_VARIANT: Record<string, string> = {
  django: 'plain',
  express: 'original',
};

export function deviconUrl(icon: string): string {
  if (!icon) return '';
  const variant = DEVICON_VARIANT[icon] ?? 'original';
  return `${DEVICON_BASE}/${icon}/${icon}-${variant}.svg`;
}

export function formatDate(ms: number | null): string {
  if (!ms) return '—';
  return new Date(ms).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`;
}
