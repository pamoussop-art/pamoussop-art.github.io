import { Draft, EMPTY_SETTINGS, SiteSettings } from './models';
import { AuthGateway, AuthUser, DataGateway, FileUploader, Repository, SettingsRepository, UploadedFile } from './ports';
import { FileKind } from './validation';

/** Dépôt en mémoire : utilisé par le mode démo et par les tests. */
export class MemoryRepository<T extends { id: string; order: number }> implements Repository<T> {
  private items = new Map<string, T>();
  private listeners = new Set<(items: T[]) => void>();
  private seq = 0;
  /** Appelé après chaque écriture (utilisé par la démo pour sauvegarder dans le navigateur). */
  onWrite?: () => void;

  constructor(initial: Draft<T>[] = [], private prefix = 'id') {
    for (const d of initial) {
      const id = this.nextId();
      this.items.set(id, { ...(d as object), id } as T);
    }
  }

  private nextId(): string {
    this.seq += 1;
    return `${this.prefix}-${this.seq}-${Math.random().toString(36).slice(2, 8)}`;
  }

  /** Copie de tous les éléments (sauvegarde). */
  exportAll(): T[] {
    return this.snapshot();
  }

  /** Remplace tout le contenu (restauration), sans déclencher onWrite. */
  importAll(items: T[]): void {
    this.items = new Map(items.map((i) => [i.id, structuredClone(i)]));
    this.emit();
  }

  private snapshot(): T[] {
    return [...this.items.values()].map((i) => structuredClone(i)).sort((a, b) => a.order - b.order);
  }

  private emit(): void {
    const snap = this.snapshot();
    this.listeners.forEach((l) => l(snap));
  }

  async list(): Promise<T[]> {
    return this.snapshot();
  }

  async create(data: Draft<T>): Promise<string> {
    const id = this.nextId();
    this.items.set(id, { ...structuredClone(data as object), id } as T);
    this.emit();
    this.onWrite?.();
    return id;
  }

  async update(id: string, patch: Partial<Draft<T>>): Promise<void> {
    const cur = this.items.get(id);
    if (!cur) throw new Error('Élément introuvable.');
    this.items.set(id, { ...cur, ...structuredClone(patch as object), id } as T);
    this.emit();
    this.onWrite?.();
  }

  async remove(id: string): Promise<void> {
    if (!this.items.delete(id)) throw new Error('Élément introuvable.');
    this.emit();
    this.onWrite?.();
  }

  watch(cb: (items: T[]) => void): () => void {
    this.listeners.add(cb);
    cb(this.snapshot());
    return () => this.listeners.delete(cb);
  }
}

export class MemorySettings implements SettingsRepository {
  private listeners = new Set<(s: SiteSettings | null) => void>();
  onWrite?: () => void;
  constructor(private value: SiteSettings | null = null) {}

  exportValue(): SiteSettings | null {
    return this.value ? structuredClone(this.value) : null;
  }

  importValue(value: SiteSettings | null): void {
    this.value = value ? structuredClone(value) : null;
    const snap = this.exportValue();
    this.listeners.forEach((l) => l(snap));
  }

  async get(): Promise<SiteSettings | null> {
    return this.value ? structuredClone(this.value) : null;
  }

  async patch(patch: Partial<SiteSettings>): Promise<void> {
    this.value = { ...(this.value ?? EMPTY_SETTINGS), ...structuredClone(patch) };
    const snap = structuredClone(this.value);
    this.listeners.forEach((l) => l(snap));
    this.onWrite?.();
  }

  watch(cb: (s: SiteSettings | null) => void): () => void {
    this.listeners.add(cb);
    cb(this.value ? structuredClone(this.value) : null);
    return () => this.listeners.delete(cb);
  }
}

export function memoryGateway(): DataGateway {
  return {
    skills: new MemoryRepository([], 'skill'),
    projects: new MemoryRepository([], 'project'),
    services: new MemoryRepository([], 'service'),
    settings: new MemorySettings(),
  };
}

/** Envoi de fichier simulé (démo) : le fichier reste dans le navigateur. */
export class MemoryUploader implements FileUploader {
  private n = 0;
  constructor(private toUrl: (file: Blob) => string | Promise<string> = () => 'memory://file') {}
  async upload(file: Blob & { name: string }, kind: FileKind): Promise<UploadedFile> {
    this.n += 1;
    const url = await this.toUrl(file);
    return { url, publicId: `demo/${kind}/${this.n}`, bytes: file.size, fileName: file.name };
  }
}

/** Connexion simulée (démo) : n'importe quel email valide + mot de passe de 6 caractères. */
export class MemoryAuth implements AuthGateway {
  private user: AuthUser | null = null;
  private listeners = new Set<(u: AuthUser | null) => void>();

  async signIn(email: string, password: string): Promise<AuthUser> {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw { code: 'auth/invalid-email' };
    if (password.length < 6) throw { code: 'auth/invalid-credential' };
    this.user = { uid: 'demo-admin', email };
    this.listeners.forEach((l) => l(this.user));
    return this.user;
  }

  async signOut(): Promise<void> {
    this.user = null;
    this.listeners.forEach((l) => l(null));
  }

  onChange(cb: (u: AuthUser | null) => void): () => void {
    this.listeners.add(cb);
    cb(this.user);
    return () => this.listeners.delete(cb);
  }
}
