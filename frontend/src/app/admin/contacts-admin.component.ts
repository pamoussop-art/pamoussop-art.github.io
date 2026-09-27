import { Component, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../core/admin-service';
import { Contacts } from '../core/models';
import { PortfolioStore } from '../state/portfolio.store';
import { ActionRunner } from './admin-actions';
import { PageHeadComponent } from './admin-ui';

@Component({
  selector: 'app-contacts-admin',
  imports: [FormsModule, PageHeadComponent],
  providers: [ActionRunner],
  template: `
    <app-page-head title="Liens de contact" subtitle="Tes coordonnées affichées dans la section Contact et en bas du site." />
    <form class="card box form" (ngSubmit)="save()" novalidate>
      <div class="two">
        <div class="field">
          <label for="ct-email">Email</label>
          <input class="inp" id="ct-email" name="email" type="email" [ngModel]="form().email" (ngModelChange)="set('email', $event)" [class.invalid]="runner.errors()['email']" />
          @if (runner.errors()['email']; as e) { <span class="err">{{ e }}</span> }
        </div>
        <div class="field">
          <label for="ct-wa">WhatsApp (avec l’indicatif)</label>
          <input class="inp" id="ct-wa" name="whatsapp" [ngModel]="form().whatsapp" (ngModelChange)="set('whatsapp', $event)" [class.invalid]="runner.errors()['whatsapp']" placeholder="+226 55 63 37 24" />
          @if (runner.errors()['whatsapp']; as e) { <span class="err">{{ e }}</span> }
        </div>
        <div class="field">
          <label for="ct-li">LinkedIn</label>
          <input class="inp" id="ct-li" name="linkedin" [ngModel]="form().linkedin" (ngModelChange)="set('linkedin', $event)" [class.invalid]="runner.errors()['linkedin']" placeholder="linkedin.com/in/ton-profil" />
          @if (runner.errors()['linkedin']; as e) { <span class="err">{{ e }}</span> }
        </div>
        <div class="field">
          <label for="ct-gh">GitHub (nom d’utilisateur ou lien)</label>
          <input class="inp" id="ct-gh" name="github" [ngModel]="form().github" (ngModelChange)="set('github', $event)" [class.invalid]="runner.errors()['github']" placeholder="pamoussop-art" />
          @if (runner.errors()['github']; as e) { <span class="err">{{ e }}</span> }
        </div>
      </div>
      <div class="foot">
        <button type="button" class="btn btn-g btn-sm" (click)="reset()">Annuler les changements</button>
        <button type="submit" class="btn btn-p btn-sm" [disabled]="runner.busy()">{{ runner.busy() ? 'Enregistrement…' : 'Enregistrer les liens' }}</button>
      </div>
    </form>
  `,
  styleUrl: './admin-pages.css',
})
export class ContactsAdminComponent {
  private store = inject(PortfolioStore);
  private admin = inject(AdminService);
  protected runner = inject(ActionRunner);
  protected form = signal<Contacts>({ email: '', whatsapp: '', linkedin: '', github: '' });
  private touched = false;

  constructor() {
    // Remplit le formulaire avec les valeurs enregistrées (tant qu'il n'a pas été modifié).
    effect(() => {
      const c = this.store.contacts();
      untracked(() => {
        if (!this.touched) this.form.set({ ...c });
      });
    });
  }

  protected set(field: keyof Contacts, value: string): void {
    this.touched = true;
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  protected reset(): void {
    this.touched = false;
    this.form.set({ ...this.store.contacts() });
    this.runner.clear();
  }

  protected async save(): Promise<void> {
    const ok = await this.runner.run(() => this.admin.updateContacts(this.form()));
    if (ok) {
      this.touched = false;
      this.form.set({ ...this.store.contacts() });
    }
  }
}
