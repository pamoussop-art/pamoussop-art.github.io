import { Project, Service, SiteSettings, Skill } from './models';
import { MemoryRepository, MemorySettings } from './memory';
import { DataGateway } from './ports';

export const DEMO_KEY = 'pphj-demo-v1';

/** Stockage clé/valeur (localStorage dans le navigateur, faux stockage dans les tests). */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface Snapshot {
  skills: Skill[];
  projects: Project[];
  services: Service[];
  settings: SiteSettings | null;
}

/**
 * Données du MODE DÉMO sauvegardées dans le navigateur :
 * les modifications faites dans l'admin restent visibles dans les autres onglets
 * et après un rechargement de la page.
 */
export class DemoBackend {
  readonly skills = new MemoryRepository<Skill>([], 'skill');
  readonly projects = new MemoryRepository<Project>([], 'project');
  readonly services = new MemoryRepository<Service>([], 'service');
  readonly settings = new MemorySettings();
  readonly gateway: DataGateway = {
    skills: this.skills,
    projects: this.projects,
    services: this.services,
    settings: this.settings,
  };

  private warned = false;

  constructor(private store: KeyValueStore | null) {
    const save = () => this.save();
    this.skills.onWrite = save;
    this.projects.onWrite = save;
    this.services.onWrite = save;
    this.settings.onWrite = save;
  }

  /** Recharge les données sauvegardées. Retourne false s'il n'y a rien. */
  load(): boolean {
    try {
      const raw = this.store?.getItem(DEMO_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw) as Snapshot;
      this.skills.importAll(d.skills ?? []);
      this.projects.importAll(d.projects ?? []);
      this.services.importAll(d.services ?? []);
      this.settings.importValue(d.settings ?? null);
      return true;
    } catch {
      return false;
    }
  }

  save(): void {
    const snap: Snapshot = {
      skills: this.skills.exportAll(),
      projects: this.projects.exportAll(),
      services: this.services.exportAll(),
      settings: this.settings.exportValue(),
    };
    try {
      this.store?.setItem(DEMO_KEY, JSON.stringify(snap));
    } catch {
      // Stockage du navigateur plein (ex. très grosse photo) : la démo continue en mémoire.
      if (!this.warned) console.warn('Démo : stockage du navigateur plein, les modifications restent en mémoire.');
      this.warned = true;
    }
  }

  reset(): void {
    this.store?.removeItem(DEMO_KEY);
  }
}
