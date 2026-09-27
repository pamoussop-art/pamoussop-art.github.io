import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../core/admin-service';
import { byOrder } from '../core/logic';
import { SERVICE_ICONS, Service, ServiceIcon } from '../core/models';
import { IconComponent } from '../shared/icon.component';
import { PortfolioStore } from '../state/portfolio.store';
import { ActionRunner } from './admin-actions';
import { ModalComponent, PageHeadComponent, RowActionsComponent } from './admin-ui';

const ICON_LABELS: Record<ServiceIcon, string> = {
  web: 'Site / application web',
  api: 'API / code',
  mobile: 'Mobile',
  pwa: 'Multi-écrans (PWA)',
  idea: 'Idée / conception',
  tools: 'Outils / maintenance',
};

@Component({
  selector: 'app-services-admin',
  imports: [FormsModule, IconComponent, ModalComponent, PageHeadComponent, RowActionsComponent],
  providers: [ActionRunner],
  template: `
    <app-page-head title="Services" subtitle="Les services proposés aux visiteurs. Les 4 premiers apparaissent aussi sous ta photo." addLabel="Ajouter un service" (add)="openNew()" />

    <div class="cards three">
      @for (s of list(); track s.id; let i = $index; let first = $first; let last = $last) {
        <article class="card hover item" [class.off]="!s.visible">
          <div class="item-top">
            <span class="ic"><app-icon [name]="s.icon" [size]="22" [stroke]="1.8" /></span>
            <span class="mini">#{{ i + 1 }}{{ 4 > i ? ' · accueil' : '' }}</span>
          </div>
          <h3>{{ s.title }}</h3>
          <p>{{ s.description }}</p>
          <div class="item-foot">
            <label class="switch-row"><button type="button" class="switch" [class.on]="s.visible" (click)="toggle(s)" [attr.aria-label]="(s.visible ? 'Masquer ' : 'Afficher ') + s.title"></button>{{ s.visible ? 'Visible' : 'Masqué' }}</label>
            <app-row-actions [first]="first" [last]="last" (up)="move(s, 'up')" (down)="move(s, 'down')" (edit)="openEdit(s)" (remove)="remove(s)" />
          </div>
        </article>
      } @empty {
        <p class="empty card">Aucun service pour l’instant. Clique sur « Ajouter un service ».</p>
      }
    </div>

    <app-modal [open]="formOpen()" [title]="editing() ? 'Modifier le service' : 'Ajouter un service'" (closed)="close()">
      <form class="form" (ngSubmit)="save()" novalidate>
        <div class="field">
          <label for="sv-title">Titre</label>
          <input class="inp" id="sv-title" name="title" [(ngModel)]="title" [class.invalid]="runner.errors()['title']" placeholder="Ex. : Applications mobiles" />
          @if (runner.errors()['title']; as e) { <span class="err">{{ e }}</span> }
        </div>
        <div class="field">
          <label for="sv-desc">Description</label>
          <textarea class="inp" id="sv-desc" name="description" [(ngModel)]="description" [class.invalid]="runner.errors()['description']" placeholder="Une phrase claire pour le visiteur"></textarea>
          <span class="hint">{{ description.length }} / 200</span>
          @if (runner.errors()['description']; as e) { <span class="err">{{ e }}</span> }
        </div>
        <div class="field">
          <span class="lbl-like">Icône</span>
          <div class="icons" role="radiogroup" aria-label="Icône">
            @for (ic of icons; track ic) {
              <button type="button" class="icon-pick" [class.on]="icon === ic" (click)="icon = ic" [attr.aria-label]="labels[ic]" [attr.aria-checked]="icon === ic" role="radio" [title]="labels[ic]">
                <app-icon [name]="ic" [size]="22" [stroke]="1.8" />
              </button>
            }
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
export class ServicesAdminComponent {
  protected store = inject(PortfolioStore);
  private admin = inject(AdminService);
  protected runner = inject(ActionRunner);
  protected readonly icons = SERVICE_ICONS;
  protected readonly labels = ICON_LABELS;

  protected formOpen = signal(false);
  protected editing = signal<Service | null>(null);
  protected title = '';
  protected description = '';
  protected icon: ServiceIcon = 'web';
  protected visible = true;

  protected list = computed(() => [...this.store.services()].sort(byOrder));

  protected openNew(): void {
    this.editing.set(null);
    this.title = '';
    this.description = '';
    this.icon = 'web';
    this.visible = true;
    this.runner.clear();
    this.formOpen.set(true);
  }

  protected openEdit(s: Service): void {
    this.editing.set(s);
    this.title = s.title;
    this.description = s.description;
    this.icon = s.icon;
    this.visible = s.visible;
    this.runner.clear();
    this.formOpen.set(true);
  }

  protected close(): void {
    this.formOpen.set(false);
  }

  protected async save(): Promise<void> {
    const data = { title: this.title, description: this.description, icon: this.icon, visible: this.visible };
    const current = this.editing();
    const ok = await this.runner.run(() => (current ? this.admin.updateService(current.id, data) : this.admin.addService(data)));
    if (ok) this.close();
  }

  protected toggle(s: Service): void {
    void this.runner.run(() => this.admin.toggleService(s.id));
  }

  protected move(s: Service, dir: 'up' | 'down'): void {
    void this.runner.run(() => this.admin.moveService(s.id, dir), { silentSuccess: true });
  }

  protected remove(s: Service): void {
    if (!this.runner.confirm(`Supprimer définitivement le service « ${s.title} » ?`)) return;
    void this.runner.run(() => this.admin.deleteService(s.id));
  }
}
