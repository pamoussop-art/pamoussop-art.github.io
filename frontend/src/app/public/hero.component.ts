import { Component, computed, inject } from '@angular/core';
import { CountUpComponent } from '../shared/count-up.component';
import { IconComponent } from '../shared/icon.component';
import { TechLogoComponent } from '../shared/tech-logo.component';
import { DEFAULT_PHOTO, PortfolioStore } from '../state/portfolio.store';

@Component({
  selector: 'app-hero',
  imports: [IconComponent, TechLogoComponent, CountUpComponent],
  template: `
    <section id="accueil" class="hero">
      <div class="gridbg"></div>
      <div class="glow pl g1"></div>
      <div class="glow g2"></div>
      <div class="glow g3"></div>

      <div class="hello a d1">
        <span class="line"></span><span class="disp">Salut, je suis</span><span class="line"></span>
      </div>
      <h1 class="disp name">
        <span class="first a d2">Prince Henri Junior</span>
        <span class="last a d3">PAMOUSSO</span>
      </h1>
      <div class="role a d4 disp">
        <span class="dots mono" aria-hidden="true">·········</span>
        <span>Développeur <span class="gtx">Full-Stack</span></span>
        <span class="dots mono" aria-hidden="true">·········</span>
      </div>
      <p class="tagline a d5"><span class="caret">Je transforme des idées en applications qui tournent vraiment.</span></p>
      <div class="bar a d5" aria-hidden="true"><span class="grow"></span><span class="pt"></span></div>
      <div class="ctas a d6">
        <a class="btn btn-p" href="#projets">Voir mes projets <app-icon name="arrow" [size]="18" [stroke]="2.2" /></a>
        @if (store.cvUrl(); as cv) {
          <a class="btn btn-g" [href]="cv" target="_blank" rel="noopener" download>
            <app-icon name="download" [size]="18" [stroke]="2.2" />Télécharger mon CV
          </a>
        }
      </div>

      <div class="visual z d6">
        <div class="photo">
          <div class="ring"></div>
          <div class="border"></div>
          <div class="img">
            <img [src]="store.photoUrl()" alt="Prince Henri Junior Pamousso" (error)="onPhotoError($event)" />
          </div>
        </div>
        <div class="card chip-dispo fl"><span class="dot"></span>Disponible · freelance &amp; emploi</div>
        <div class="card chip-stack fl2">
          <span class="mono lbl">STACK PRINCIPALE</span>
          <span class="row">
            <span class="st"><app-tech-logo icon="angular" [size]="20" />Angular</span>
            <span class="st"><app-tech-logo icon="spring" [size]="20" />Spring Boot</span>
            <span class="st"><app-tech-logo icon="python" [size]="20" />Python</span>
          </span>
        </div>
      </div>

      @if (topServices().length) {
        <div class="svc">
          @for (s of topServices(); track s.id; let i = $index) {
            <a href="#services" class="card hover svc-card a" [class.hl]="i === 1" [style.animation-delay.s]="0.95 + i * 0.1">
              <span class="ic"><app-icon [name]="s.icon" [size]="26" [stroke]="1.8" /></span>
              <span class="t">{{ s.title }}</span>
              <span class="u"></span>
            </a>
          }
        </div>
      }

      <div class="card stats a d8">
        <div class="stat"><span class="disp n"><app-count-up [to]="store.stats().projects" /></span><span>Projets</span></div>
        <span class="sep"></span>
        <div class="stat"><span class="disp n"><app-count-up [to]="store.stats().years" /> ans</span><span>d'expérience</span></div>
        <span class="sep"></span>
        <div class="stat"><span class="disp n"><app-count-up [to]="store.stats().technologies" />+</span><span>Technologies</span></div>
        <a class="btn btn-p cta" href="#contact">Discutons de votre projet <app-icon name="arrow" [size]="18" [stroke]="2.2" /></a>
      </div>
      <div class="motto disp a d8">
        <span class="line"></span>Frontend <b>•</b> Backend <b>•</b> Mobile <b>•</b> Déploiement<span class="line"></span>
      </div>
    </section>
  `,
  styleUrl: './hero.component.css',
})
export class HeroComponent {
  protected store = inject(PortfolioStore);
  /** Les 4 premiers services visibles, affichés sous la photo. */
  protected topServices = computed(() => this.store.visibleServices().slice(0, 4));

  onPhotoError(e: Event): void {
    const img = e.target as HTMLImageElement;
    if (!img.src.endsWith(DEFAULT_PHOTO)) img.src = DEFAULT_PHOTO;
  }
}
