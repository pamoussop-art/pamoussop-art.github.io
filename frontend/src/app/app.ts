import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './state/theme.service';
import { ToastService } from './state/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <router-outlet />
    <div class="toasts" aria-live="polite">
      @for (t of toast.toasts(); track t.id) {
        <button type="button" class="toast" [class.toast-error]="t.kind === 'error'" (click)="toast.dismiss(t.id)">
          @if (t.kind === 'ok') {
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7" /></svg>
          } @else {
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 8v5M12 16.5v.01" /><circle cx="12" cy="12" r="9" /></svg>
          }
          <span>{{ t.text }}</span>
        </button>
      }
    </div>
  `,
})
export class App {
  protected toast = inject(ToastService);
  // Le service de thème applique le thème dès le démarrage.
  private theme = inject(ThemeService);
}
