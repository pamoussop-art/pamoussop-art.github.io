import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../core/admin-service';
import { byOrder } from '../core/logic';
import { Project, ProjectStatus } from '../core/models';
import { parseTechList } from '../core/validation';
import { TechLogoComponent } from '../shared/tech-logo.component';
import { PortfolioStore } from '../state/portfolio.store';
import { ActionRunner } from './admin-actions';
import { ModalComponent, PageHeadComponent, RowActionsComponent } from './admin-ui';

@Component({
  selector: 'app-projects-admin',
  imports: [FormsModule, TechLogoComponent, ModalComponent, PageHeadComponent, RowActionsComponent],
  providers: [ActionRunner],
  template: `
    <app-page-head title="Projets" subtitle="Tes réalisations, telles qu’elles apparaissent dans « Mes réalisations »." addLabel="Ajouter un projet" (add)="openNew()" />

    <div class="cards">
      @for (p of list(); track p.id; let first = $first; let last = $last) {
        <article class="card hover item" [class.off]="!p.visible">
          <div class="item-top">
            <h3>{{ p.title }}</h3>
            <span class="badge" [class.ok]="p.status === 'termine'">
              @if (p.status === 'en-cours') { <i></i> }{{ p.status === 'en-cours' ? 'En cours' : 'Terminé' }}
            </span>
          </div>
          <p>{{ p.description }}</p>
          <div class="logos">
            @for (t of p.tech; track t) { <app-tech-logo [icon]="t" [name]="t" [size]="34" /> }
            @if (!p.tech.length) { <span class="mini">Aucune technologie renseignée</span> }
          </div>
          <span class="mini">{{ p.category || 'Sans catégorie' }} · {{ p.repoUrl ? 'code ✓' : 'pas de lien code' }} · {{ p.demoUrl ? 'démo ✓' : 'pas de démo' }}</span>
          <div class="item-foot">
            <label class="switch-row"><button type="button" class="switch" [class.on]="p.visible" (click)="toggle(p)" [attr.aria-label]="(p.visible ? 'Masquer ' : 'Afficher ') + p.title"></button>{{ p.visible ? 'Visible' : 'Masqué' }}</label>
            <app-row-actions [first]="first" [last]="last" (up)="move(p, 'up')" (down)="move(p, 'down')" (edit)="openEdit(p)" (remove)="remove(p)" />
          </div>
        </article>
      } @empty {
        <p class="empty card">Aucun projet pour l’instant. Clique sur « Ajouter un projet ».</p>
      }
    </div>

    <app-modal [open]="formOpen()" [title]="editing() ? 'Modifier le projet' : 'Ajouter un projet'" (closed)="close()">
      <form class="form" (ngSubmit)="save()" novalidate>
        <div class="field">
          <label for="pr-title">Titre</label>
          <input class="inp" id="pr-title" name="title" [(ngModel)]="title" [class.invalid]="runner.errors()['title']" placeholder="Ex. : FASOGUARDIAN" />
          @if (runner.errors()['title']; as e) { <span class="err">{{ e }}</span> }
        </div>
        <div class="field">
          <label for="pr-desc">Description</label>
          <textarea class="inp" id="pr-desc" name="description" [(ngModel)]="description" [class.invalid]="runner.errors()['description']" placeholder="1 à 2 phrases : le problème, ce que tu as construit"></textarea>
          <span class="hint">{{ description.length }} / 300</span>
          @if (runner.errors()['description']; as e) { <span class="err">{{ e }}</span> }
        </div>
        <div class="two">
          <div class="field">
            <label for="pr-cat">Catégorie (filtre)</label>
            <input class="inp" id="pr-cat" name="category" [(ngModel)]="category" list="pr-cats" placeholder="Sites web, E-commerce, SaaS…" />
            <datalist id="pr-cats">
              @for (c of categories(); track c) { <option [value]="c"></option> }
            </datalist>
            @if (runner.errors()['category']; as e) { <span class="err">{{ e }}</span> }
          </div>
          <div class="field">
            <span class="lbl-like">Statut</span>
            <div class="seg" role="group" aria-label="Statut">
              <button type="button" [class.on]="status === 'termine'" (click)="status = 'termine'">Terminé</button>
              <button type="button" [class.on]="status === 'en-cours'" (click)="status = 'en-cours'">En cours</button>
            </div>
          </div>
        </div>
        <div class="field">
          <label for="pr-tech">Technologies (logos affichés sur la carte)</label>
          <input class="inp" id="pr-tech" name="tech" [(ngModel)]="tech" [class.invalid]="runner.errors()['tech']" placeholder="angular, spring, postgresql" />
          <div class="logos">
            @for (t of techPreview(); track t) { <app-tech-logo [icon]="t" [name]="t" [size]="34" /> }
          </div>
          <span class="hint">Noms Devicon séparés par des virgules. <a href="https://devicon.dev" target="_blank" rel="noopener">Voir tous les logos</a></span>
          @if (runner.errors()['tech']; as e) { <span class="err">{{ e }}</span> }
        </div>
        <div class="two">
          <div class="field">
            <label for="pr-repo">Lien du code source</label>
            <input class="inp" id="pr-repo" name="repoUrl" [(ngModel)]="repoUrl" [class.invalid]="runner.errors()['repoUrl']" placeholder="https://github.com/…" />
            @if (runner.errors()['repoUrl']; as e) { <span class="err">{{ e }}</span> }
          </div>
          <div class="field">
            <label for="pr-demo">Lien de la démo</label>
            <input class="inp" id="pr-demo" name="demoUrl" [(ngModel)]="demoUrl" [class.invalid]="runner.errors()['demoUrl']" placeholder="https://…" />
            @if (runner.errors()['demoUrl']; as e) { <span class="err">{{ e }}</span> }
          </div>
        </div>
        <label class="switch-row"><button type="button" class="switch" [class.on]="visible" (click)="visible = !visible" aria-label="Visible sur le site"></button>Visible sur le site</label>
        <div class="foot">
          <button type="button" class="btn btn-g btn-sm" (click)="close()">Annuler</button>
          <button type="submit" class="btn btn-p btn-sm" [disabled]="runner.busy()">{{ runner.busy() ? 'Enregistrement…' : 'Enregistrer' }}</button>
        </div>
      </form>
    </app-modal>
  `,
  styleUrl: './admin-pages.css',
})
export class ProjectsAdminComponent {
  protected store = inject(PortfolioStore);
  private admin = inject(AdminService);
  protected runner = inject(ActionRunner);

  protected formOpen = signal(false);
  protected editing = signal<Project | null>(null);
  protected title = '';
  protected description = '';
  protected category = '';
  protected tech = '';
  protected repoUrl = '';
  protected demoUrl = '';
  protected status: ProjectStatus = 'termine';
  protected visible = true;

  protected list = computed(() => [...this.store.projects()].sort(byOrder));
  protected categories = computed(() =>
    [...new Set(['Sites web', 'E-commerce', 'SaaS', 'Mobile', 'API', ...this.store.projects().map((p) => p.category).filter(Boolean)])],
  );

  protected techPreview(): string[] {
    return parseTechList(this.tech).slice(0, 10);
  }

  protected openNew(): void {
    this.editing.set(null);
    this.title = '';
    this.description = '';
    this.category = '';
    this.tech = '';
    this.repoUrl = '';
    this.demoUrl = '';
    this.status = 'termine';
    this.visible = true;
    this.runner.clear();
    this.formOpen.set(true);
  }

  protected openEdit(p: Project): void {
    this.editing.set(p);
    this.title = p.title;
    this.description = p.description;
    this.category = p.category;
    this.tech = p.tech.join(', ');
    this.repoUrl = p.repoUrl;
    this.demoUrl = p.demoUrl;
    this.status = p.status;
    this.visible = p.visible;
    this.runner.clear();
    this.formOpen.set(true);
  }

  protected close(): void {
    this.formOpen.set(false);
  }

  protected async save(): Promise<void> {
    const data = {
      title: this.title,
      description: this.description,
      category: this.category,
      tech: this.tech,
      repoUrl: this.repoUrl,
      demoUrl: this.demoUrl,
      status: this.status,
      visible: this.visible,
    };
    const current = this.editing();
    const ok = await this.runner.run(() => (current ? this.admin.updateProject(current.id, data) : this.admin.addProject(data)));
    if (ok) this.close();
  }

  protected toggle(p: Project): void {
    void this.runner.run(() => this.admin.toggleProject(p.id));
  }

  protected move(p: Project, dir: 'up' | 'down'): void {
    void this.runner.run(() => this.admin.moveProject(p.id, dir), { silentSuccess: true });
  }

  protected remove(p: Project): void {
    if (!this.runner.confirm(`Supprimer définitivement le projet « ${p.title} » ?`)) return;
    void this.runner.run(() => this.admin.deleteProject(p.id));
  }
}
