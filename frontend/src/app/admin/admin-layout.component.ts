import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminService } from '../core/admin-service';
import { formatDate } from '../core/logic';
import { DEMO_MODE, DEMO_RESET } from '../infra/backend';
import { IconComponent } from '../shared/icon.component';
import { PortfolioStore } from '../state/portfolio.store';
import { SessionService } from '../state/session.service';
import { ThemeService } from '../state/theme.service';
import { ToastService } from '../state/toast.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <div class="shell">
      <aside [class.open]="menu()">
        <div class="brand">
          <span class="logo disp">PP<span>HJ</span></span>
          <div><div class="t">Administration</div><div class="mono s">portfolio</div></div>
        </div>
        <nav aria-label="Menu administrateur">
          @for (l of links; track l.path) {
            <a class="sb" [routerLink]="l.path" routerLinkActive="on" (click)="menu.set(false)">
              <app-icon [name]="l.icon" [size]="19" />{{ l.label }}
            </a>
          }
        </nav>
        <div class="bottom">
          <a class="sb" routerLink="/" target="_blank"><app-icon name="eye" [size]="19" />Voir le site</a>
          <button type="button" class="sb" (click)="logout()"><app-icon name="logout" [size]="19" />Déconnexion</button>
        </div>
      </aside>

      <div class="main">
        @if (demo) {
          <div class="demo">
            <span>Mode démo : tes modifications sont gardées dans ce navigateur uniquement. Configure Firebase (guide, étape 2) pour les mettre en ligne.</span>
            <button type="button" class="reset" (click)="resetDemo()">Réinitialiser la démo</button>
          </div>
        }
        <header class="top">
          <button type="button" class="ico burger" (click)="menu.set(!menu())" aria-label="Menu"><app-icon [name]="menu() ? 'close' : 'menu'" /></button>
          <div class="hello mono">Bonjour, Prince Henri</div>
          <button type="button" class="ico" (click)="theme.toggle()" [attr.aria-label]="theme.theme() === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'">
            <app-icon [name]="theme.theme() === 'dark' ? 'sun' : 'moon'" />
          </button>
        </header>

        <div class="stats">
          <div class="card hover stat"><span class="mono">COMPÉTENCES</span><b class="disp">{{ store.skills().length }}</b></div>
          <div class="card hover stat"><span class="mono">PROJETS</span><b class="disp">{{ store.projects().length }}</b></div>
          <div class="card hover stat"><span class="mono">SERVICES</span><b class="disp">{{ store.services().length }}</b></div>
          <div class="card hover stat"><span class="mono">CV MIS À JOUR</span><b class="disp small">{{ cvDate() }}</b></div>
        </div>

        @if (store.isEmpty()) {
          <div class="card empty">
            <div>
              <h2 class="disp">Ta base de données est vide</h2>
              <p>Importe en un clic ton contenu de départ : compétences, services, projets et liens de contact. Tu pourras tout modifier ensuite.</p>
            </div>
            <button type="button" class="btn btn-p" (click)="seed()" [disabled]="seeding()">{{ seeding() ? 'Import…' : 'Importer le contenu de départ' }}</button>
          </div>
        }

        <router-outlet />
      </div>
    </div>
  `,
  styles: `
    .shell { display: flex; min-height: 100vh; }
    aside { width: 272px; flex-shrink: 0; background: var(--side); border-right: 1px solid var(--line); display: flex; flex-direction: column; padding: 28px 18px; gap: 34px; position: sticky; top: 0; height: 100vh; transition: background .5s, transform .35s; }
    .brand { display: flex; align-items: center; gap: 12px; padding: 0 6px; }
    .logo { height: 44px; padding: 0 12px; border-radius: 12px; border: 1.5px solid var(--ac); display: flex; align-items: center; font-weight: 800; font-size: 14px; letter-spacing: .12em; box-shadow: 0 0 20px -6px var(--glow); }
    .logo span { color: var(--ac2); }
    .t { font-weight: 800; } .s { font-size: 11px; color: var(--mu2); }
    nav, .bottom { display: flex; flex-direction: column; gap: 6px; }
    .bottom { margin-top: auto; }
    .sb { display: flex; align-items: center; gap: 12px; min-height: 46px; padding: 0 14px; border-radius: 12px; color: var(--mu); font: 700 15px 'Manrope', sans-serif; background: transparent; border: 0; cursor: pointer; width: 100%; text-align: left; transition: background .25s, color .25s, transform .25s; }
    .sb:hover { background: var(--acs); color: var(--tx); transform: translateX(4px); }
    .sb.on { background: var(--ac); color: #fff; box-shadow: 0 10px 26px -10px var(--glow); }
    .main { flex-grow: 1; min-width: 0; padding: 26px 44px 60px; display: flex; flex-direction: column; gap: 24px; }
    .demo { font: 600 13px 'JetBrains Mono', monospace; color: var(--warn); background: var(--warnbg); padding: 10px 14px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
    .reset { border: 1px solid currentColor; background: transparent; color: inherit; font: inherit; padding: 6px 12px; border-radius: 999px; cursor: pointer; }
    .reset:hover { background: var(--warnbg); }
    .top { display: flex; align-items: center; gap: 12px; }
    .hello { flex-grow: 1; color: var(--ac2); font-size: 13px; }
    .burger { display: none; }
    .stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; }
    .stat { padding: 20px 22px; display: flex; flex-direction: column; gap: 6px; animation: up .6s cubic-bezier(.2,.7,.2,1) both; }
    .stat span { font-size: 12px; color: var(--mu); letter-spacing: .08em; }
    .stat b { font-size: 32px; font-weight: 800; }
    .stat b.small { font-size: 22px; line-height: 38px; }
    .empty { padding: 28px; display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; border-style: dashed; border-color: var(--ac); }
    .empty h2 { font-size: 22px; margin-bottom: 6px; }
    .empty p { color: var(--mu); max-width: 620px; }
    @media (max-width: 1000px) {
      aside { position: fixed; z-index: 60; left: 0; top: 0; transform: translateX(-100%); box-shadow: 20px 0 60px rgba(0,0,0,.4); }
      aside.open { transform: none; }
      .burger { display: inline-flex; }
      .main { padding: 20px; }
      .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
  `,
})
export class AdminLayoutComponent {
  protected store = inject(PortfolioStore);
  protected theme = inject(ThemeService);
  protected demo = inject(DEMO_MODE);
  private demoReset = inject(DEMO_RESET);
  private session = inject(SessionService);
  private router = inject(Router);
  private admin = inject(AdminService);
  private toast = inject(ToastService);
  protected menu = signal(false);
  protected seeding = signal(false);
  protected cvDate = computed(() => (this.store.cvUrl() ? formatDate(this.store.settings().cvUpdatedAt) : '—'));

  protected links = [
    { path: 'competences', label: 'Compétences', icon: 'grid' },
    { path: 'projets', label: 'Projets', icon: 'code' },
    { path: 'services', label: 'Services', icon: 'box' },
    { path: 'cv-photo', label: 'CV & photo', icon: 'file' },
    { path: 'contact', label: 'Liens de contact', icon: 'link' },
  ];

  async seed(): Promise<void> {
    this.seeding.set(true);
    const r = await this.admin.seedIfEmpty();
    this.seeding.set(false);
    this.toast.show(r.message, r.ok ? 'ok' : 'error');
  }

  protected resetDemo(): void {
    if (!window.confirm('Effacer toutes les modifications de la démo et revenir au contenu de départ ?')) return;
    this.demoReset?.();
    window.location.reload();
  }

  async logout(): Promise<void> {
    await this.session.signOut();
    await this.router.navigateByUrl('/admin/connexion');
  }
}
