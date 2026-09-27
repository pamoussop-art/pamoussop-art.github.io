import { Injectable, computed, inject, signal } from '@angular/core';
import { computeStats, contactLinks, groupSkills } from '../core/logic';
import { EMPTY_SETTINGS, Project, Service, SiteSettings, Skill } from '../core/models';
import { DATA } from '../infra/backend';

/** Photo affichée tant qu'aucune photo n'a été envoyée depuis l'admin. */
export const DEFAULT_PHOTO = 'photo.jpg';

/**
 * Données du portfolio en temps réel (site public ET admin).
 * Toute modification faite dans l'admin apparaît immédiatement sur le site.
 */
@Injectable({ providedIn: 'root' })
export class PortfolioStore {
  private data = inject(DATA);

  readonly skills = signal<Skill[]>([]);
  readonly projects = signal<Project[]>([]);
  readonly services = signal<Service[]>([]);
  readonly settingsRaw = signal<SiteSettings | null>(null);
  readonly loaded = signal(false);
  readonly error = signal<string | null>(null);

  readonly settings = computed<SiteSettings>(() => this.settingsRaw() ?? EMPTY_SETTINGS);
  readonly skillGroups = computed(() => groupSkills(this.skills()));
  readonly visibleServices = computed(() => this.services().filter((s) => s.visible));
  readonly stats = computed(() => computeStats(this.skills(), this.projects(), this.settings().yearsExperience));
  readonly contacts = computed(() => this.settings().contacts);
  readonly links = computed(() => contactLinks(this.settings().contacts));
  readonly photoUrl = computed(() => this.settings().photoUrl || DEFAULT_PHOTO);
  readonly cvUrl = computed(() => this.settings().cvUrl);
  readonly isEmpty = computed(
    () => this.loaded() && !this.skills().length && !this.projects().length && !this.services().length,
  );

  private pending = 4;

  constructor() {
    const onError = (e: unknown) => {
      console.error(e);
      this.error.set('Impossible de charger les données. Vérifie la configuration Firebase.');
      this.markLoaded();
    };
    this.data.skills.watch((v) => { this.skills.set(v); this.markLoaded('skills'); }, onError);
    this.data.projects.watch((v) => { this.projects.set(v); this.markLoaded('projects'); }, onError);
    this.data.services.watch((v) => { this.services.set(v); this.markLoaded('services'); }, onError);
    this.data.settings.watch((v) => { this.settingsRaw.set(v); this.markLoaded('settings'); }, onError);
  }

  private seen = new Set<string>();
  /** loaded passe à true quand les 4 sources ont répondu au moins une fois. */
  private markLoaded(source?: string): void {
    if (source) this.seen.add(source);
    if (!source || this.seen.size >= this.pending) this.loaded.set(true);
  }
}
