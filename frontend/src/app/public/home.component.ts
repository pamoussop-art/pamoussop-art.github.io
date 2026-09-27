import { Component, inject } from '@angular/core';
import { DEMO_MODE } from '../infra/backend';
import { PortfolioStore } from '../state/portfolio.store';
import { HeroComponent } from './hero.component';
import { NavbarComponent } from './navbar.component';
import {
  AboutComponent,
  ContactComponent,
  FooterComponent,
  ProjectsComponent,
  ServicesComponent,
  SkillsComponent,
} from './sections.component';

@Component({
  selector: 'app-home',
  imports: [
    NavbarComponent,
    HeroComponent,
    AboutComponent,
    ServicesComponent,
    SkillsComponent,
    ProjectsComponent,
    ContactComponent,
    FooterComponent,
  ],
  template: `
    @if (demo) {
      <div class="demo">Mode démo : Firebase n’est pas encore configuré. Les modifications faites dans l’admin sont visibles uniquement dans ce navigateur.</div>
    }
    @if (store.error(); as err) {
      <div class="demo error">{{ err }}</div>
    }
    <app-navbar />
    <main>
      <app-hero />
      <app-about />
      <app-services />
      <app-skills />
      <app-projects />
      <app-contact />
    </main>
    <app-footer />
  `,
  styles: `
    .demo { padding: 10px 20px; text-align: center; font: 600 13px 'JetBrains Mono', monospace; background: var(--warnbg); color: var(--warn); }
    .demo.error { background: var(--redbg); color: var(--red); }
  `,
})
export class HomeComponent {
  protected store = inject(PortfolioStore);
  protected demo = inject(DEMO_MODE);
}
