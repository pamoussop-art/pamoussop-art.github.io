import { Component, computed, inject, signal } from '@angular/core';
import { AdminService } from '../core/admin-service';
import { formatBytes, formatDate } from '../core/logic';
import { FileKind, validateFile } from '../core/validation';
import { IconComponent } from '../shared/icon.component';
import { DEFAULT_PHOTO, PortfolioStore } from '../state/portfolio.store';
import { ActionRunner } from './admin-actions';
import { PageHeadComponent } from './admin-ui';
import { DEMO_MODE } from '../infra/backend';
import { ToastService } from '../state/toast.service';

interface Picked {
  file: File;
  preview: string | null;
  error: string | null;
}

@Component({
  selector: 'app-files-admin',
  imports: [IconComponent, PageHeadComponent],
  providers: [ActionRunner],
  template: `
    <app-page-head title="CV & photo" subtitle="Remplace ou supprime tes fichiers : le site se met à jour tout seul." />

    <div class="cards">
      <!-- ---------------- CV ---------------- -->
      <section class="card box">
        <h2 class="disp">Mon CV</h2>
        <div class="current">
          <span class="pdf mono">PDF</span>
          <div class="grow">
            @if (settings().cvUrl) {
              <div class="fname">{{ settings().cvFileName || 'cv.pdf' }}</div>
              <div class="mono meta">En ligne · mis à jour le {{ date(settings().cvUpdatedAt) }}</div>
            } @else {
              <div class="fname">Aucun CV en ligne</div>
              <div class="mono meta">Le bouton « Télécharger mon CV » est masqué sur le site.</div>
            }
          </div>
          @if (settings().cvUrl) {
            <a class="btn btn-g btn-sm" [href]="settings().cvUrl" target="_blank" rel="noopener">Voir</a>
          }
        </div>

        <label class="drop" [class.over]="over() === 'cv'" (dragover)="onDrag($event, 'cv')" (dragleave)="over.set(null)" (drop)="onDrop($event, 'cv')">
          <input type="file" accept="application/pdf,.pdf" class="sr-only" (change)="onPick($event, 'cv')" />
          <app-icon name="upload" [size]="28" [stroke]="1.8" />
          @if (cv(); as p) {
            <b>{{ p.file.name }}</b><span class="mono">{{ size(p.file.size) }}</span>
          } @else {
            <b>Glisse ton CV ici ou clique pour choisir</b><span class="mono">PDF · 5 Mo max</span>
          }
        </label>
        @if (cv()?.error; as e) { <span class="err">{{ e }}</span> }

        <div class="foot">
          @if (settings().cvUrl) {
            <button type="button" class="btn btn-danger btn-sm" (click)="remove('cv')" [disabled]="runner.busy()">Supprimer le CV</button>
          }
          <button type="button" class="btn btn-p btn-sm" (click)="upload('cv')" [disabled]="!canSend('cv')">
            {{ sending() === 'cv' ? 'Envoi en cours…' : settings().cvUrl ? 'Remplacer le CV' : 'Mettre le CV en ligne' }}
          </button>
        </div>
      </section>

      <!-- ---------------- Photo ---------------- -->
      <section class="card box">
        <h2 class="disp">Photo de profil</h2>
        <div class="current">
          <img class="avatar" [src]="photo()?.preview || store.photoUrl()" alt="Photo de profil actuelle" />
          <p class="meta2">
            @if (settings().photoUrl) {
              Photo en ligne · mise à jour le {{ date(settings().photoUpdatedAt) }}
            } @else {
              Photo par défaut affichée.
            }
            <br />Conseil : format carré, 800 × 800 px minimum, visage centré.
          </p>
        </div>

        <label class="drop" [class.over]="over() === 'photo'" (dragover)="onDrag($event, 'photo')" (dragleave)="over.set(null)" (drop)="onDrop($event, 'photo')">
          <input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" (change)="onPick($event, 'photo')" />
          <app-icon name="upload" [size]="28" [stroke]="1.8" />
          @if (photo(); as p) {
            <b>{{ p.file.name }}</b><span class="mono">{{ size(p.file.size) }} · aperçu à gauche</span>
          } @else {
            <b>Glisse une photo ici ou clique pour choisir</b><span class="mono">JPG · PNG · WEBP · 5 Mo max</span>
          }
        </label>
        @if (photo()?.error; as e) { <span class="err">{{ e }}</span> }

        <div class="foot">
          @if (settings().photoUrl) {
            <button type="button" class="btn btn-danger btn-sm" (click)="remove('photo')" [disabled]="runner.busy()">Revenir à la photo par défaut</button>
          }
          <button type="button" class="btn btn-p btn-sm" (click)="upload('photo')" [disabled]="!canSend('photo')">
            {{ sending() === 'photo' ? 'Envoi en cours…' : 'Remplacer la photo' }}
          </button>
        </div>
      </section>
    </div>
  `,
  styleUrl: './admin-pages.css',
})
export class FilesAdminComponent {
  protected store = inject(PortfolioStore);
  private admin = inject(AdminService);
  protected runner = inject(ActionRunner);
  private demo = inject(DEMO_MODE);
  private toast = inject(ToastService);
  protected settings = this.store.settings;
  protected defaultPhoto = DEFAULT_PHOTO;

  protected cv = signal<Picked | null>(null);
  protected photo = signal<Picked | null>(null);
  protected over = signal<FileKind | null>(null);
  protected sending = signal<FileKind | null>(null);

  protected date = formatDate;
  protected size = formatBytes;

  protected canSend = (kind: FileKind) => {
    const p = kind === 'cv' ? this.cv() : this.photo();
    return !!p && !p.error && !this.runner.busy();
  };

  private setPicked(kind: FileKind, file: File | undefined | null): void {
    if (!file) return;
    const error = validateFile(file, kind);
    const target = kind === 'cv' ? this.cv : this.photo;
    const old = target();
    if (old?.preview) URL.revokeObjectURL(old.preview);
    const preview = kind === 'photo' && !error ? URL.createObjectURL(file) : null;
    target.set({ file, preview, error });
  }

  protected onPick(e: Event, kind: FileKind): void {
    const input = e.target as HTMLInputElement;
    this.setPicked(kind, input.files?.[0]);
    input.value = '';
  }

  protected onDrag(e: DragEvent, kind: FileKind): void {
    e.preventDefault();
    this.over.set(kind);
  }

  protected onDrop(e: DragEvent, kind: FileKind): void {
    e.preventDefault();
    this.over.set(null);
    this.setPicked(kind, e.dataTransfer?.files?.[0]);
  }

  protected async upload(kind: FileKind): Promise<void> {
    const picked = kind === 'cv' ? this.cv() : this.photo();
    if (!picked || picked.error) return;
    this.sending.set(kind);
    const ok = await this.runner.run(() => this.admin.replaceFile(picked.file, kind));
    this.sending.set(null);
    if (ok) (kind === 'cv' ? this.cv : this.photo).set(null);
    // En démo, le fichier est gardé dans le navigateur, dont la place est limitée (~5 Mo).
    if (ok && this.demo && picked.file.size > 2 * 1024 * 1024) {
      this.toast.show('Mode démo : fichier volumineux, il peut n’apparaître que dans cet onglet. Aucun souci une fois Cloudinary configuré.', 'error');
    }
  }

  protected remove(kind: FileKind): void {
    const msg =
      kind === 'cv'
        ? 'Retirer ton CV du site ? Le bouton « Télécharger mon CV » disparaîtra jusqu’au prochain envoi.'
        : 'Revenir à la photo par défaut ?';
    if (!this.runner.confirm(msg)) return;
    void this.runner.run(() => this.admin.deleteFile(kind));
  }
}
