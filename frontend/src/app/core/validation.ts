import { Contacts, Draft, Project, SERVICE_ICONS, Service, Skill } from './models';

/** Erreurs de validation : clé = nom du champ, valeur = message en français. */
export type FieldErrors = Record<string, string>;

export interface Valid<T> {
  ok: true;
  value: T;
}
export interface Invalid {
  ok: false;
  errors: FieldErrors;
}
export type Validation<T> = Valid<T> | Invalid;

const clean = (v: unknown): string => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '');

export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return (u.protocol === 'http:' || u.protocol === 'https:') && u.hostname.includes('.');
  } catch {
    return false;
  }
}

/** Ajoute https:// si l'utilisateur a oublié le protocole. Chaîne vide conservée. */
export function normalizeUrl(value: string): string {
  const v = clean(value);
  if (!v) return '';
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

export const DEVICON_SLUG = /^[a-z0-9]+(?:[a-z0-9.-]*[a-z0-9])?$/;

export function normalizeIcon(value: string): string {
  return clean(value).toLowerCase().replace(/\s+/g, '');
}

export function validateSkill(
  input: Partial<Draft<Skill>>,
  existing: Skill[],
  editingId?: string,
): Validation<Omit<Draft<Skill>, 'order'>> {
  const errors: FieldErrors = {};
  const name = clean(input.name);
  const category = clean(input.category);
  const icon = normalizeIcon(input.icon ?? '');

  if (!name) errors['name'] = 'Le nom est obligatoire.';
  else if (name.length > 40) errors['name'] = 'Le nom ne doit pas dépasser 40 caractères.';
  else if (existing.some((s) => s.id !== editingId && s.name.toLowerCase() === name.toLowerCase())) {
    errors['name'] = 'Cette compétence existe déjà.';
  }
  if (!category) errors['category'] = 'Choisis une catégorie.';
  else if (category.length > 30) errors['category'] = 'La catégorie ne doit pas dépasser 30 caractères.';
  if (icon && !DEVICON_SLUG.test(icon)) {
    errors['icon'] = 'Nom de logo invalide (lettres minuscules, chiffres et tirets, ex. « angular »).';
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { name, category, icon, visible: input.visible ?? true } };
}

export function parseTechList(value: string | string[]): string[] {
  const parts = Array.isArray(value) ? value : value.split(/[,;\n]/);
  const out: string[] = [];
  for (const p of parts) {
    const t = normalizeIcon(p);
    if (t && !out.includes(t)) out.push(t);
  }
  return out;
}

/** Données saisies pour un projet : les technologies peuvent être une liste ou un texte « a, b, c ». */
export type ProjectInput = Partial<Omit<Draft<Project>, 'tech'>> & { tech?: string[] | string };

export function validateProject(
  input: ProjectInput,
): Validation<Omit<Draft<Project>, 'order'>> {
  const errors: FieldErrors = {};
  const title = clean(input.title);
  const description = clean(input.description);
  const category = clean(input.category);
  const repoUrl = normalizeUrl(input.repoUrl ?? '');
  const demoUrl = normalizeUrl(input.demoUrl ?? '');
  const tech = parseTechList(input.tech ?? []);
  const status = input.status ?? 'termine';

  if (!title) errors['title'] = 'Le titre est obligatoire.';
  else if (title.length > 60) errors['title'] = 'Le titre ne doit pas dépasser 60 caractères.';
  if (!description) errors['description'] = 'La description est obligatoire.';
  else if (description.length > 300) errors['description'] = 'La description ne doit pas dépasser 300 caractères.';
  if (category.length > 30) errors['category'] = 'La catégorie ne doit pas dépasser 30 caractères.';
  if (repoUrl && !isHttpUrl(repoUrl)) errors['repoUrl'] = 'Lien du code invalide.';
  if (demoUrl && !isHttpUrl(demoUrl)) errors['demoUrl'] = 'Lien de démo invalide.';
  if (tech.length > 10) errors['tech'] = '10 technologies maximum.';
  else if (tech.some((t) => !DEVICON_SLUG.test(t))) errors['tech'] = 'Utilise des noms de logos simples, séparés par des virgules (ex. angular, spring).';
  if (status !== 'en-cours' && status !== 'termine') errors['status'] = 'Statut invalide.';

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: { title, description, category, tech, repoUrl, demoUrl, status, visible: input.visible ?? true },
  };
}

export function validateService(input: Partial<Draft<Service>>): Validation<Omit<Draft<Service>, 'order'>> {
  const errors: FieldErrors = {};
  const title = clean(input.title);
  const description = clean(input.description);
  const icon = input.icon ?? 'web';
  if (!title) errors['title'] = 'Le titre est obligatoire.';
  else if (title.length > 50) errors['title'] = 'Le titre ne doit pas dépasser 50 caractères.';
  if (!description) errors['description'] = 'La description est obligatoire.';
  else if (description.length > 200) errors['description'] = 'La description ne doit pas dépasser 200 caractères.';
  if (!SERVICE_ICONS.includes(icon)) errors['icon'] = 'Icône invalide.';
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { title, description, icon, visible: input.visible ?? true } };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Ne garde que le nom d'utilisateur GitHub (accepte un lien complet). */
export function normalizeGithub(value: string): string {
  const v = clean(value).replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  const m = v.match(/^github\.com\/([^/?#]+)/i);
  return (m ? m[1] : v).replace(/^@/, '').replace(/\/+$/, '');
}

export function validateContacts(input: Partial<Contacts>): Validation<Contacts> {
  const errors: FieldErrors = {};
  const email = clean(input.email).toLowerCase();
  const whatsapp = clean(input.whatsapp);
  const linkedin = normalizeUrl(input.linkedin ?? '');
  const github = normalizeGithub(input.github ?? '');

  if (!EMAIL.test(email)) errors['email'] = 'Adresse email invalide.';
  const digits = whatsapp.replace(/\D/g, '');
  if (!/^\+?[\d\s.-]+$/.test(whatsapp) || digits.length < 8 || digits.length > 15) {
    errors['whatsapp'] = 'Numéro invalide : indique l’indicatif, ex. +226 55 63 37 24.';
  }
  if (!linkedin || !isHttpUrl(linkedin) || !/linkedin\.com\//i.test(linkedin)) {
    errors['linkedin'] = 'Lien LinkedIn invalide (ex. linkedin.com/in/ton-profil).';
  }
  if (!/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(github)) errors['github'] = 'Nom d’utilisateur GitHub invalide.';

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { email, whatsapp, linkedin, github } };
}

export type FileKind = 'cv' | 'photo';

export interface FileLike {
  name: string;
  type: string;
  size: number;
}

export const MAX_FILE_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Retourne un message d'erreur, ou null si le fichier est accepté. */
export function validateFile(file: FileLike | null | undefined, kind: FileKind): string | null {
  if (!file) return 'Aucun fichier sélectionné.';
  if (file.size <= 0) return 'Le fichier est vide.';
  if (file.size > MAX_FILE_BYTES) return 'Le fichier dépasse 5 Mo.';
  if (kind === 'cv') {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    return isPdf ? null : 'Le CV doit être un fichier PDF.';
  }
  return PHOTO_TYPES.includes(file.type) ? null : 'La photo doit être au format JPG, PNG ou WEBP.';
}
