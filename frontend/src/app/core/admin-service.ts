import { Contacts, Draft, EMPTY_SETTINGS, Project, Service, SiteSettings, Skill } from './models';
import { DataGateway, FileUploader, Repository } from './ports';
import { SEED_PROJECTS, SEED_SERVICES, SEED_SETTINGS, SEED_SKILLS } from './seed';
import {
  FieldErrors,
  FileKind,
  ProjectInput,
  validateContacts,
  validateFile,
  validateProject,
  validateService,
  validateSkill,
} from './validation';

/** Résultat d'une action admin : succès, ou erreurs à afficher dans le formulaire. */
export type ActionResult<T = void> =
  | { ok: true; value: T; message: string }
  | { ok: false; errors: FieldErrors; message: string };

const success = <T>(value: T, message: string): ActionResult<T> => ({ ok: true, value, message });
const failure = (message: string, errors: FieldErrors = {}): ActionResult<never> => ({ ok: false, errors, message });

function explain(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  if (code === 'permission-denied' || code === 'firestore/permission-denied') {
    return 'Action refusée : ce compte n’a pas les droits administrateur.';
  }
  if (code === 'unavailable') return 'Connexion impossible. Vérifie ta connexion internet.';
  const msg = (e as { message?: string })?.message;
  return msg ? `Erreur : ${msg}` : 'Une erreur inattendue est survenue.';
}

type Direction = 'up' | 'down';

/**
 * Toute la logique métier de l'espace administrateur.
 * Chaque méthode valide les données, écrit dans la base et renvoie un message clair.
 */
export class AdminService {
  constructor(
    private data: DataGateway,
    private uploader: FileUploader,
    private now: () => number = () => Date.now(),
  ) {}

  // ---------- Contenu de départ ----------

  /** Importe le contenu de départ uniquement si la base est vide (jamais d'écrasement). */
  async seedIfEmpty(): Promise<ActionResult<{ imported: boolean }>> {
    try {
      const [skills, projects, services, settings] = await Promise.all([
        this.data.skills.list(),
        this.data.projects.list(),
        this.data.services.list(),
        this.data.settings.get(),
      ]);
      if (skills.length || projects.length || services.length) {
        return success({ imported: false }, 'La base contient déjà du contenu : rien n’a été importé.');
      }
      for (const s of SEED_SKILLS) await this.data.skills.create(s);
      for (const s of SEED_SERVICES) await this.data.services.create(s);
      for (const p of SEED_PROJECTS) await this.data.projects.create(p);
      if (!settings) await this.data.settings.patch(SEED_SETTINGS);
      return success({ imported: true }, 'Contenu de départ importé.');
    } catch (e) {
      return failure(explain(e));
    }
  }

  // ---------- Compétences ----------

  async addSkill(input: Partial<Draft<Skill>>): Promise<ActionResult<string>> {
    try {
      const all = await this.data.skills.list();
      const v = validateSkill(input, all);
      if (!v.ok) return failure('Corrige les champs en rouge.', v.errors);
      const order = nextOrder(all.filter((s) => s.category === v.value.category));
      const id = await this.data.skills.create({ ...v.value, order });
      return success(id, `« ${v.value.name} » ajoutée.`);
    } catch (e) {
      return failure(explain(e));
    }
  }

  async updateSkill(id: string, input: Partial<Draft<Skill>>): Promise<ActionResult> {
    try {
      const all = await this.data.skills.list();
      const current = all.find((s) => s.id === id);
      if (!current) return failure('Cette compétence n’existe plus.');
      const v = validateSkill({ ...current, ...input }, all, id);
      if (!v.ok) return failure('Corrige les champs en rouge.', v.errors);
      const patch: Partial<Draft<Skill>> = { ...v.value };
      // Changement de catégorie : la compétence passe en fin de sa nouvelle catégorie.
      if (v.value.category !== current.category) {
        patch.order = nextOrder(all.filter((s) => s.category === v.value.category));
      }
      await this.data.skills.update(id, patch);
      return success(undefined, `« ${v.value.name} » modifiée.`);
    } catch (e) {
      return failure(explain(e));
    }
  }

  deleteSkill(id: string) {
    return this.remove(this.data.skills, id, (s) => s.name);
  }

  toggleSkill(id: string) {
    return this.toggle(this.data.skills, id, (s) => s.name);
  }

  /** Déplace une compétence d'un cran à l'intérieur de sa catégorie. */
  async moveSkill(id: string, dir: Direction): Promise<ActionResult> {
    try {
      const all = await this.data.skills.list();
      const cur = all.find((s) => s.id === id);
      if (!cur) return failure('Cette compétence n’existe plus.');
      return this.swap(this.data.skills, all.filter((s) => s.category === cur.category), id, dir);
    } catch (e) {
      return failure(explain(e));
    }
  }

  // ---------- Projets ----------

  async addProject(input: ProjectInput): Promise<ActionResult<string>> {
    try {
      const v = validateProject(input);
      if (!v.ok) return failure('Corrige les champs en rouge.', v.errors);
      const all = await this.data.projects.list();
      const id = await this.data.projects.create({ ...v.value, order: nextOrder(all) });
      return success(id, `« ${v.value.title} » ajouté.`);
    } catch (e) {
      return failure(explain(e));
    }
  }

  async updateProject(id: string, input: ProjectInput): Promise<ActionResult> {
    try {
      const all = await this.data.projects.list();
      const current = all.find((p) => p.id === id);
      if (!current) return failure('Ce projet n’existe plus.');
      const v = validateProject({ ...current, ...input });
      if (!v.ok) return failure('Corrige les champs en rouge.', v.errors);
      await this.data.projects.update(id, v.value);
      return success(undefined, `« ${v.value.title} » modifié.`);
    } catch (e) {
      return failure(explain(e));
    }
  }

  deleteProject(id: string) {
    return this.remove(this.data.projects, id, (p) => p.title);
  }

  toggleProject(id: string) {
    return this.toggle(this.data.projects, id, (p) => p.title);
  }

  async moveProject(id: string, dir: Direction): Promise<ActionResult> {
    try {
      return this.swap(this.data.projects, await this.data.projects.list(), id, dir);
    } catch (e) {
      return failure(explain(e));
    }
  }

  // ---------- Services ----------

  async addService(input: Partial<Draft<Service>>): Promise<ActionResult<string>> {
    try {
      const v = validateService(input);
      if (!v.ok) return failure('Corrige les champs en rouge.', v.errors);
      const all = await this.data.services.list();
      const id = await this.data.services.create({ ...v.value, order: nextOrder(all) });
      return success(id, `« ${v.value.title} » ajouté.`);
    } catch (e) {
      return failure(explain(e));
    }
  }

  async updateService(id: string, input: Partial<Draft<Service>>): Promise<ActionResult> {
    try {
      const all = await this.data.services.list();
      const current = all.find((s) => s.id === id);
      if (!current) return failure('Ce service n’existe plus.');
      const v = validateService({ ...current, ...input });
      if (!v.ok) return failure('Corrige les champs en rouge.', v.errors);
      await this.data.services.update(id, v.value);
      return success(undefined, `« ${v.value.title} » modifié.`);
    } catch (e) {
      return failure(explain(e));
    }
  }

  deleteService(id: string) {
    return this.remove(this.data.services, id, (s) => s.title);
  }

  toggleService(id: string) {
    return this.toggle(this.data.services, id, (s) => s.title);
  }

  async moveService(id: string, dir: Direction): Promise<ActionResult> {
    try {
      return this.swap(this.data.services, await this.data.services.list(), id, dir);
    } catch (e) {
      return failure(explain(e));
    }
  }

  // ---------- CV & photo ----------

  /** Envoie le nouveau fichier puis met le site à jour. En cas d'échec, l'ancien reste en place. */
  async replaceFile(file: (Blob & { name: string; type: string }) | null, kind: FileKind): Promise<ActionResult<SiteSettings>> {
    const invalid = validateFile(file, kind);
    if (invalid || !file) return failure(invalid ?? 'Aucun fichier sélectionné.', { file: invalid ?? '' });
    let uploaded;
    try {
      uploaded = await this.uploader.upload(file, kind);
    } catch (e) {
      return failure(`L’envoi du fichier a échoué. ${explain(e).replace(/^Erreur : /, '')}`.trim());
    }
    try {
      const patch: Partial<SiteSettings> =
        kind === 'cv'
          ? { cvUrl: uploaded.url, cvFileName: uploaded.fileName, cvPublicId: uploaded.publicId, cvUpdatedAt: this.now() }
          : { photoUrl: uploaded.url, photoPublicId: uploaded.publicId, photoUpdatedAt: this.now() };
      await this.data.settings.patch(patch);
      const settings = (await this.data.settings.get()) ?? { ...EMPTY_SETTINGS, ...patch };
      return success(settings, kind === 'cv' ? 'CV mis à jour : le site propose le nouveau fichier.' : 'Photo de profil mise à jour.');
    } catch (e) {
      return failure(explain(e));
    }
  }

  /** Retire le CV (ou la photo) du site. Le bouton « Télécharger mon CV » disparaît. */
  async deleteFile(kind: FileKind): Promise<ActionResult> {
    try {
      const current = await this.data.settings.get();
      const has = kind === 'cv' ? current?.cvUrl : current?.photoUrl;
      if (!has) return failure(kind === 'cv' ? 'Aucun CV à supprimer.' : 'Aucune photo à supprimer.');
      await this.data.settings.patch(
        kind === 'cv'
          ? { cvUrl: null, cvFileName: null, cvPublicId: null, cvUpdatedAt: this.now() }
          : { photoUrl: null, photoPublicId: null, photoUpdatedAt: this.now() },
      );
      return success(undefined, kind === 'cv' ? 'CV supprimé du site.' : 'Photo supprimée : la photo par défaut est affichée.');
    } catch (e) {
      return failure(explain(e));
    }
  }

  // ---------- Liens de contact ----------

  async updateContacts(input: Partial<Contacts>): Promise<ActionResult<Contacts>> {
    const v = validateContacts(input);
    if (!v.ok) return failure('Corrige les champs en rouge.', v.errors);
    try {
      await this.data.settings.patch({ contacts: v.value });
      return success(v.value, 'Liens de contact enregistrés.');
    } catch (e) {
      return failure(explain(e));
    }
  }

  // ---------- Outils communs ----------

  private async remove<T extends { id: string }>(repo: Repository<T>, id: string, label: (t: T) => string): Promise<ActionResult> {
    try {
      const item = (await repo.list()).find((i) => i.id === id);
      if (!item) return failure('Cet élément n’existe plus.');
      await repo.remove(id);
      return success(undefined, `« ${label(item)} » supprimé.`);
    } catch (e) {
      return failure(explain(e));
    }
  }

  private async toggle<T extends { id: string; visible: boolean }>(
    repo: Repository<T>,
    id: string,
    label: (t: T) => string,
  ): Promise<ActionResult<boolean>> {
    try {
      const item = (await repo.list()).find((i) => i.id === id);
      if (!item) return failure('Cet élément n’existe plus.');
      const visible = !item.visible;
      await repo.update(id, { visible } as Partial<Draft<T>>);
      return success(visible, visible ? `« ${label(item)} » est visible sur le site.` : `« ${label(item)} » est masqué du site.`);
    } catch (e) {
      return failure(explain(e));
    }
  }

  private async swap<T extends { id: string; order: number }>(
    repo: Repository<T>,
    group: T[],
    id: string,
    dir: Direction,
  ): Promise<ActionResult> {
    const sorted = [...group].sort((a, b) => a.order - b.order);
    const i = sorted.findIndex((x) => x.id === id);
    if (i < 0) return failure('Cet élément n’existe plus.');
    const j = dir === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= sorted.length) return failure(dir === 'up' ? 'Déjà en première position.' : 'Déjà en dernière position.');
    // Renumérote proprement (1, 2, 3…) puis échange les deux éléments.
    const reordered = [...sorted];
    [reordered[i], reordered[j]] = [reordered[j], reordered[i]];
    for (let k = 0; k < reordered.length; k++) {
      if (reordered[k].order !== k + 1) {
        await repo.update(reordered[k].id, { order: k + 1 } as Partial<Draft<T>>);
      }
    }
    return success(undefined, 'Ordre mis à jour.');
  }
}

export function nextOrder(items: { order: number }[]): number {
  return items.reduce((m, i) => Math.max(m, i.order), 0) + 1;
}
