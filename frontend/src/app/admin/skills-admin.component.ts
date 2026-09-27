import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../core/admin-service';
import { allCategories, byOrder, deviconUrl } from '../core/logic';
import { Skill } from '../core/models';
import { TechLogoComponent } from '../shared/tech-logo.component';
import { PortfolioStore } from '../state/portfolio.store';
import { ActionRunner } from './admin-actions';
import { ModalComponent, PageHeadComponent, RowActionsComponent } from './admin-ui';

const NEW_CATEGORY = '__nouvelle__';

@Component({
  selector: 'app-skills-admin',
  imports: [FormsModule, TechLogoComponent, ModalComponent, PageHeadComponent, RowActionsComponent],
  providers: [ActionRunner],
  template: `
    <app-page-head title="Compétences" subtitle="Ajoute, modifie, masque ou réordonne les technologies affichées sur le site." addLabel="Ajouter une compétence" (add)="openNew()" />

    <div class="chips" role="group" aria-label="Filtrer par catégorie">
      @for (c of chips(); track c) {
        <button type="button" class="chip" [class.on]="c === cat()" (click)="cat.set(c)">{{ c }}</button>
      }
    </div>

    <div class="card table">
      <div class="row th mono"><span>LOGO</span><span>NOM</span><span>CATÉGORIE</span><span>VISIBLE</span><span>ACTIONS</span></div>
      @for (s of rows(); track s.id) {
        <div class="row" [class.off]="!s.visible">
          <app-tech-logo [icon]="s.icon" [name]="s.name" [size]="40" />
          <span class="name">{{ s.name }}</span>
          <span class="muted">{{ s.category }}</span>
          <span><button type="button" class="switch" [class.on]="s.visible" (click)="toggle(s)" [attr.aria-label]="(s.visible ? 'Masquer ' : 'Afficher ') + s.name" [attr.aria-pressed]="s.visible"></button></span>
          <app-row-actions [first]="isFirst(s)" [last]="isLast(s)" (up)="move(s, 'up')" (down)="move(s, 'down')" (edit)="openEdit(s)" (remove)="remove(s)" />
        </div>
      } @empty {
        <p class="empty">Aucune compétence ici. Clique sur « Ajouter une compétence ».</p>
      }
    </div>
    <p class="hint">Les flèches déplacent une compétence à l’intérieur de sa catégorie. Une compétence masquée reste enregistrée mais n’apparaît plus sur le site.</p>

    <app-modal [open]="formOpen()" [title]="editing() ? 'Modifier la compétence' : 'Ajouter une compétence'" (closed)="close()">
      <form class="form" (ngSubmit)="save()" novalidate>
        <div class="field">
          <label for="sk-name">Nom</label>
          <input class="inp" id="sk-name" name="name" [(ngModel)]="name" [class.invalid]="runner.errors()['name']" placeholder="Ex. : Kotlin" />
          @if (runner.errors()['name']; as e) { <span class="err">{{ e }}</span> }
        </div>
        <div class="two">
          <div class="field">
            <label for="sk-cat">Catégorie</label>
            <select class="inp" id="sk-cat" name="category" [(ngModel)]="category">
              @for (c of categories(); track c) { <option [value]="c">{{ c }}</option> }
              <option [value]="NEW">+ Nouvelle catégorie…</option>
            </select>
            @if (category === NEW) {
              <input class="inp" name="newCategory" [(ngModel)]="newCategory" placeholder="Nom de la nouvelle catégorie" [class.invalid]="runner.errors()['category']" />
            }
            @if (runner.errors()['category']; as e) { <span class="err">{{ e }}</span> }
          </div>
          <div class="field">
            <label for="sk-icon">Logo (nom Devicon)</label>
            <div class="icon-row">
              <input class="inp" id="sk-icon" name="icon" [(ngModel)]="icon" [class.invalid]="runner.errors()['icon']" placeholder="ex. kotlin" />
              <app-tech-logo [icon]="icon.trim().toLowerCase()" [name]="name || '?'" [size]="46" />
            </div>
            @if (runner.errors()['icon']; as e) { <span class="err">{{ e }}</span> }
            <span class="hint">Laisse vide pour afficher les initiales. <a href="https://devicon.dev" target="_blank" rel="noopener">Voir tous les logos</a></span>
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
export class SkillsAdminComponent {
  protected store = inject(PortfolioStore);
  private admin = inject(AdminService);
  protected runner = inject(ActionRunner);
  protected readonly NEW = NEW_CATEGORY;

  protected cat = signal('Toutes');
  protected formOpen = signal(false);
  protected editing = signal<Skill | null>(null);
  protected name = '';
  protected category = 'Frontend';
  protected newCategory = '';
  protected icon = '';
  protected visible = true;

  protected categories = computed(() => allCategories(this.store.skills()));
  protected chips = computed(() => ['Toutes', ...this.categories().filter((c) => this.store.skills().some((s) => s.category === c))]);
  protected rows = computed(() => {
    const all = this.store.skills();
    const list = this.cat() === 'Toutes' ? all : all.filter((s) => s.category === this.cat());
    // Tri : ordre des catégories, puis ordre dans la catégorie.
    const cats = this.categories();
    return [...list].sort((a, b) => cats.indexOf(a.category) - cats.indexOf(b.category) || byOrder(a, b));
  });

  private group(s: Skill): Skill[] {
    return this.store.skills().filter((x) => x.category === s.category).sort(byOrder);
  }
  protected isFirst(s: Skill): boolean {
    return this.group(s)[0]?.id === s.id;
  }
  protected isLast(s: Skill): boolean {
    return this.group(s).at(-1)?.id === s.id;
  }

  protected openNew(): void {
    this.editing.set(null);
    this.name = '';
    this.category = this.cat() !== 'Toutes' ? this.cat() : 'Frontend';
    this.newCategory = '';
    this.icon = '';
    this.visible = true;
    this.runner.clear();
    this.formOpen.set(true);
  }

  protected openEdit(s: Skill): void {
    this.editing.set(s);
    this.name = s.name;
    this.category = s.category;
    this.newCategory = '';
    this.icon = s.icon;
    this.visible = s.visible;
    this.runner.clear();
    this.formOpen.set(true);
  }

  protected close(): void {
    this.formOpen.set(false);
  }

  protected async save(): Promise<void> {
    const data = {
      name: this.name,
      category: this.category === NEW_CATEGORY ? this.newCategory : this.category,
      icon: this.icon,
      visible: this.visible,
    };
    const current = this.editing();
    const ok = await this.runner.run(() => (current ? this.admin.updateSkill(current.id, data) : this.admin.addSkill(data)));
    if (ok) this.close();
  }

  protected toggle(s: Skill): void {
    void this.runner.run(() => this.admin.toggleSkill(s.id));
  }

  protected move(s: Skill, dir: 'up' | 'down'): void {
    void this.runner.run(() => this.admin.moveSkill(s.id, dir), { silentSuccess: true });
  }

  protected remove(s: Skill): void {
    if (!this.runner.confirm(`Supprimer définitivement « ${s.name} » ?`)) return;
    void this.runner.run(() => this.admin.deleteSkill(s.id));
  }

  protected readonly deviconUrl = deviconUrl;
}
