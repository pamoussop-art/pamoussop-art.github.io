import { Injectable, inject, signal } from '@angular/core';
import { ActionResult } from '../core/admin-service';
import { FieldErrors } from '../core/validation';
import { ToastService } from '../state/toast.service';

/**
 * Exécute une action admin : empêche le double clic, affiche le message
 * de succès ou d'erreur, et renvoie les erreurs de champs au formulaire.
 */
@Injectable()
export class ActionRunner {
  private toast = inject(ToastService);
  readonly busy = signal(false);
  readonly errors = signal<FieldErrors>({});

  async run(action: () => Promise<ActionResult<unknown>>, opts: { silentSuccess?: boolean } = {}): Promise<boolean> {
    if (this.busy()) return false;
    this.busy.set(true);
    this.errors.set({});
    try {
      const r = await action();
      if (r.ok) {
        if (!opts.silentSuccess) this.toast.show(r.message);
        return true;
      }
      this.errors.set(r.errors);
      this.toast.show(r.message, 'error');
      return false;
    } finally {
      this.busy.set(false);
    }
  }

  clear(): void {
    this.errors.set({});
  }

  /** Demande une confirmation avant une action irréversible. */
  confirm(message: string): boolean {
    return window.confirm(message);
  }
}
