import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../shared/icon.component';
import { ThemeService } from '../state/theme.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, IconComponent],
  template: `
    <header class="nav" [class.scrolled]="scrolled()">
      <div class="nav-in">
        <a href="#accueil" class="logo disp" aria-label="Accueil">PP<span>HJ</span></a>
        <nav class="links" [class.open]="open()" aria-label="Navigation principale">
          @for (l of links; track l.id) {
            <a class="nl" [class.on]="active() === l.id" [href]="'#' + l.id" (click)="open.set(false)">{{ l.label }}</a>
          }
        </nav>
        <div class="actions">
          <button type="button" class="ico" (click)="theme.toggle()" [attr.aria-label]="theme.theme() === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'">
            <app-icon [name]="theme.theme() === 'dark' ? 'sun' : 'moon'" />
          </button>
          <a class="ico" routerLink="/admin" aria-label="Me connecter (espace administrateur)" title="Me connecter">
            <app-icon name="lock" />
          </a>
          <button type="button" class="ico burger" (click)="open.set(!open())" [attr.aria-expanded]="open()" aria-label="Menu">
            <app-icon [name]="open() ? 'close' : 'menu'" />
          </button>
        </div>
      </div>
    </header>
  `,
  styles: `
    .nav { position: sticky; top: 0; z-index: 50; background: var(--glass); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-bottom: 1px solid transparent; transition: border-color .3s, background .5s; }
    .nav.scrolled { border-bottom-color: var(--line); }
    .nav-in { width: min(1296px, 100% - 40px); margin-inline: auto; height: 84px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
    .logo { height: 48px; padding: 0 15px; border-radius: 14px; border: 1.5px solid var(--ac); color: var(--tx); display: flex; align-items: center; font-weight: 800; font-size: 17px; letter-spacing: .12em; box-shadow: 0 0 24px -6px var(--glow); transition: transform .3s, box-shadow .3s; }
    .logo:hover { color: var(--tx); transform: scale(1.05); box-shadow: 0 0 30px -4px var(--glow); }
    .logo span { color: var(--ac2); }
    .links { display: flex; gap: 32px; }
    .nl { position: relative; color: var(--mu); font-weight: 700; font-size: 15px; padding: 10px 2px; transition: color .25s; }
    .nl::after { content: ''; position: absolute; left: 0; right: 0; bottom: 2px; height: 2px; border-radius: 2px; background: var(--ac); transform: scaleX(0); transform-origin: left; transition: transform .35s cubic-bezier(.2,.7,.2,1); }
    .nl:hover, .nl.on { color: var(--tx); }
    .nl:hover::after, .nl.on::after { transform: scaleX(1); }
    .actions { display: flex; gap: 10px; }
    .burger { display: none; }
    @media (max-width: 900px) {
      .burger { display: inline-flex; }
      .links { position: fixed; top: 84px; left: 0; right: 0; flex-direction: column; gap: 0; padding: 10px 20px 24px; background: var(--bg); border-bottom: 1px solid var(--line); transform: translateY(-120%); opacity: 0; transition: transform .4s cubic-bezier(.2,.7,.2,1), opacity .3s; pointer-events: none; }
      .links.open { transform: none; opacity: 1; pointer-events: auto; }
      .nl { padding: 16px 4px; font-size: 18px; border-bottom: 1px solid var(--line); }
      .nl::after { display: none; }
    }
  `,
})
export class NavbarComponent {
  protected theme = inject(ThemeService);
  protected open = signal(false);
  protected scrolled = signal(false);
  protected active = signal('accueil');
  protected links = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'apropos', label: 'À propos' },
    { id: 'services', label: 'Services' },
    { id: 'competences', label: 'Compétences' },
    { id: 'projets', label: 'Projets' },
    { id: 'contact', label: 'Contact' },
  ];

  /** Met en évidence la section visible dans le menu. */
  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 10);
    let current = 'accueil';
    for (const l of this.links) {
      const el = document.getElementById(l.id);
      if (el && el.getBoundingClientRect().top <= 140) current = l.id;
    }
    this.active.set(current);
  }
}
