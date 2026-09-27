import { Draft, Project, Service, SiteSettings, Skill } from './models';
import { FileKind } from './validation';

/** Accès à une collection (Firestore en production, mémoire en démo et en tests). */
export interface Repository<T extends { id: string }> {
  list(): Promise<T[]>;
  create(data: Draft<T>): Promise<string>;
  update(id: string, patch: Partial<Draft<T>>): Promise<void>;
  remove(id: string): Promise<void>;
  /** Écoute en temps réel ; retourne une fonction pour arrêter l'écoute. */
  watch(cb: (items: T[]) => void, onError?: (e: unknown) => void): () => void;
}

export interface SettingsRepository {
  get(): Promise<SiteSettings | null>;
  patch(patch: Partial<SiteSettings>): Promise<void>;
  watch(cb: (s: SiteSettings | null) => void, onError?: (e: unknown) => void): () => void;
}

export interface UploadedFile {
  url: string;
  publicId: string;
  bytes: number;
  fileName: string;
}

export interface FileUploader {
  upload(file: Blob & { name: string }, kind: FileKind): Promise<UploadedFile>;
}

export interface AuthUser {
  uid: string;
  email: string | null;
}

export interface AuthGateway {
  signIn(email: string, password: string): Promise<AuthUser>;
  signOut(): Promise<void>;
  /** Appelé immédiatement avec l'état courant, puis à chaque changement. */
  onChange(cb: (user: AuthUser | null) => void): () => void;
}

export interface DataGateway {
  skills: Repository<Skill>;
  projects: Repository<Project>;
  services: Repository<Service>;
  settings: SettingsRepository;
}
