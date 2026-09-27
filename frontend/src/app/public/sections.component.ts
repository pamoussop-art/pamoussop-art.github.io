import { Component, computed, inject, signal } from '@angular/core';
import { PROJECT_FILTER_ALL, filterProjects, formatDate, linkedinHandle, projectFilters } from '../core/logic';
import { IconComponent } from '../shared/icon.component';
import { RevealDirective } from '../shared/reveal.directive';
import { TechLogoComponent } from '../shared/tech-logo.component';
import { PortfolioStore } from '../state/portfolio.store';

/* ------------------------------ À propos ------------------------------ */

@Component({
  selector: 'app-about',
  imports: [RevealDirective],
  template: `
    <section id="apropos" class="container about">
      <div class="glow"></div>
      <div class="code" appReveal>
        <div class="bar"><i class="r"></i><i class="y"></i><i class="g"></i><span class="mono">moi.ts</span></div>
        <div class="mono body">
          <div><span class="k">const</span> <span class="v">moi</span> = {{ '{' }}</div>
          <div class="in">nom: <span class="s">"Prince Henri Junior"</span>,</div>
          <div class="in">rôle: <span class="s">"Full-Stack"</span>,</div>
          <div class="in">basé: <span class="s">"Ouagadougou, Burkina Faso"</span>,</div>
          <div class="in">apprend: <span class="s">"IA"</span>,</div>
          <div class="in">dispo: <span class="b">true</span>,</div>
          <div>{{ '}' }};<span class="caret"></span></div>
        </div>
      </div>
      <div class="txt" appReveal>
        <div class="eyebrow">— À propos</div>
        <h2 class="h2">Qui suis-je ?</h2>
        <p>
          Je suis <b>Prince Henri Junior Pamousso</b>, développeur full-stack. J’aime prendre une idée et la mener jusqu’au bout :
          l’interface que l’utilisateur voit, l’API qui la fait tourner, et la base de données qui garde tout en ordre. Je travaille
          surtout avec <b>Angular</b>, <b>Spring Boot</b> et <b>Python</b>, et je crée aussi des applications mobiles avec Flutter et React Native.
        </p>
        <p>
          Ce que j’aime par-dessus tout, c’est travailler en équipe. Pendant le développement, je n’hésite pas à donner mon avis, proposer
          une autre approche ou poser la bonne question au bon moment — parce qu’un bon projet, c’est d’abord une équipe qui se parle.
        </p>
      </div>
    </section>
  `,
  styles: `
    .about { position: relative; display: flex; align-items: center; gap: 80px; padding: 110px 0; }
    .glow { width: 360px; height: 360px; left: -60px; top: 200px; opacity: .35; }
    .code { position: relative; width: 480px; flex-shrink: 0; background: #0a1122; border: 1px solid rgba(140,165,255,.22); border-radius: 22px; overflow: hidden; color: #dbe4ff; box-shadow: 0 30px 60px -30px rgba(0,0,0,.6); transition: transform .4s, box-shadow .4s; }
    .code:hover { transform: translateY(-6px) rotate(-.6deg); box-shadow: 0 34px 60px -26px var(--glow); }
    .bar { height: 48px; display: flex; align-items: center; gap: 8px; padding: 0 20px; border-bottom: 1px solid rgba(140,165,255,.16); }
    .bar i { width: 12px; height: 12px; border-radius: 50%; }
    .r { background: #ff5f57; } .y { background: #febc2e; } .g { background: #28c840; }
    .bar span { margin-left: 12px; font-size: 13px; color: #8d99bd; }
    .body { padding: 26px 28px 30px; font-size: 17px; line-height: 2; }
    .in { padding-left: 26px; }
    .k { color: #c792ea; } .v { color: #78a7ff; } .s { color: #7ee2a8; } .b { color: #ff9e64; }
    .txt { display: flex; flex-direction: column; gap: 24px; flex-grow: 1; }
    .txt p { font-size: 19px; line-height: 1.75; color: var(--mu); }
    .txt b { color: var(--tx); }
    @media (max-width: 980px) {
      .about { flex-direction: column-reverse; align-items: stretch; gap: 40px; padding: 80px 0; }
      .code { width: 100%; }
      .body { font-size: 14px; padding: 20px; }
      .txt p { font-size: 17px; }
    }
  `,
})
export class AboutComponent {}

/* ------------------------------ Services ------------------------------ */

@Component({
  selector: 'app-services',
  imports: [IconComponent, RevealDirective],
  template: `
    @if (store.visibleServices().length) {
      <section id="services" class="container sec">
        <div class="head" appReveal>
          <div class="eyebrow">— Services —</div>
          <h2 class="h2">Ce que je peux faire pour vous</h2>
        </div>
        <div class="grid">
          @for (s of store.visibleServices(); track s.id) {
            <article class="card hover item" appReveal>
              <span class="ic big"><app-icon [name]="s.icon" [size]="26" [stroke]="1.8" /></span>
              <h3 class="disp">{{ s.title }}</h3>
              <p>{{ s.description }}</p>
            </article>
          }
        </div>
      </section>
    }
  `,
  styles: `
    .sec { padding: 100px 0; display: flex; flex-direction: column; gap: 56px; }
    .head { display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
    .item { padding: 32px; display: flex; flex-direction: column; gap: 16px; min-height: 250px; }
    .big { width: 60px; height: 60px; }
    h3 { font-size: 21px; font-weight: 700; }
    p { color: var(--mu); line-height: 1.6; font-size: 16px; }
    @media (max-width: 980px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 620px) { .grid { grid-template-columns: 1fr; } .item { min-height: 0; } .sec { padding: 70px 0; } }
  `,
})
export class ServicesComponent {
  protected store = inject(PortfolioStore);
}

/* ---------------------------- Compétences ----------------------------- */

@Component({
  selector: 'app-skills',
  imports: [TechLogoComponent, RevealDirective],
  template: `
    @if (store.skillGroups().length) {
      <section id="competences" class="container sec">
        <div class="glow"></div>
        <div class="head" appReveal>
          <div class="eyebrow">— Compétences —</div>
          <h2 class="h2">Mes outils au quotidien</h2>
        </div>
        <div class="grid">
          @for (g of store.skillGroups(); track g.category) {
            <article class="card hover cat" [class.learning]="g.learning" appReveal>
              <div class="top">
                <h3 class="disp">{{ g.category }}</h3>
                @if (g.learning) {
                  <span class="badge"><i></i>Actuellement</span>
                }
              </div>
              <div class="tiles">
                @for (s of g.skills; track s.id) {
                  <div class="tile">
                    <app-tech-logo [icon]="s.icon" [name]="s.name" />
                    <span>{{ s.name }}</span>
                  </div>
                }
              </div>
            </article>
          }
        </div>
      </section>
    }
  `,
  styles: `
    .sec { position: relative; padding: 100px 0; display: flex; flex-direction: column; gap: 56px; }
    .glow { width: 500px; height: 500px; right: -160px; top: 300px; opacity: .3; }
    .head { position: relative; display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; }
    .grid { position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; align-items: start; }
    .cat { padding: 28px; display: flex; flex-direction: column; gap: 20px; }
    .cat { min-width: 0; }
    .top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    h3 { font-size: 20px; font-weight: 700; }
    .tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(86px, 1fr)); gap: 10px; }
    .tile { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 16px 6px; border-radius: 16px; background: var(--card2); border: 1px solid var(--line); font-size: 13px; font-weight: 700; text-align: center; min-width: 0; transition: transform .3s cubic-bezier(.2,.7,.2,1), border-color .3s, background .3s; }
    .tile span { max-width: 100%; line-height: 1.25; overflow-wrap: anywhere; hyphens: auto; }
    .tile:hover { transform: translateY(-6px) scale(1.05); border-color: var(--ac); background: var(--acs); }
    @media (max-width: 1100px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 680px) { .grid { grid-template-columns: 1fr; } .sec { padding: 70px 0; } .tiles { grid-template-columns: repeat(auto-fill, minmax(78px, 1fr)); } .cat { padding: 20px; } }
  `,
})
export class SkillsComponent {
  protected store = inject(PortfolioStore);
}

/* ------------------------------ Projets ------------------------------- */

@Component({
  selector: 'app-projects',
  imports: [TechLogoComponent, RevealDirective, IconComponent],
  template: `
    @if (filters().length > 1 || shown().length) {
      <section id="projets" class="container sec">
        <div class="head" appReveal>
          <div class="ttl">
            <div class="eyebrow">— Projets</div>
            <h2 class="h2">Mes réalisations</h2>
          </div>
          <div class="filters" role="group" aria-label="Filtrer les projets">
            @for (f of filters(); track f) {
              <button type="button" class="chip" [class.on]="f === filter()" [attr.aria-pressed]="f === filter()" (click)="pick(f)">{{ f }}</button>
            }
          </div>
        </div>
        <div class="grid">
          @for (p of visible(); track p.id) {
            <article class="card hover proj">
              <div class="top">
                @if (p.tech.length) {
                  <div class="logos">
                    @for (t of p.tech; track t) {
                      <app-tech-logo [icon]="t" [name]="t" [size]="52" />
                    }
                  </div>
                } @else {
                  <span class="ic disp mono-logo">{{ initials(p.title) }}</span>
                }
                @if (p.status === 'en-cours') {
                  <span class="badge"><i></i>En cours</span>
                }
              </div>
              <h3 class="disp">{{ p.title }}</h3>
              <p>{{ p.description }}</p>
              <div class="links">
                @if (p.repoUrl) {
                  <a [href]="p.repoUrl" target="_blank" rel="noopener">Code source <app-icon name="external" [size]="15" /></a>
                }
                @if (p.demoUrl) {
                  <a [href]="p.demoUrl" target="_blank" rel="noopener">Démo en ligne <app-icon name="external" [size]="15" /></a>
                }
                @if (!p.repoUrl && !p.demoUrl) {
                  <span class="soon">Liens bientôt disponibles</span>
                }
              </div>
            </article>
          } @empty {
            <p class="empty">Aucun projet dans cette catégorie pour le moment.</p>
          }
        </div>
        @if (shown().length > limit()) {
          <div class="more">
            <button type="button" class="btn btn-g" (click)="limit.set(limit() + 4)">Afficher plus de projets</button>
          </div>
        }
      </section>
    }
  `,
  styles: `
    .sec { padding: 100px 0; display: flex; flex-direction: column; gap: 44px; }
    .head { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
    .ttl { display: flex; flex-direction: column; gap: 16px; }
    .filters { display: flex; gap: 10px; flex-wrap: wrap; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px; }
    .proj { padding: 34px; display: flex; flex-direction: column; gap: 18px; min-height: 296px; animation: pop .5s cubic-bezier(.2,.7,.2,1) both; }
    .top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
    .logos { display: flex; gap: 10px; flex-wrap: wrap; }
    .mono-logo { width: 68px; height: 68px; border-radius: 20px; font-size: 20px; font-weight: 800; }
    h3 { font-size: 25px; font-weight: 700; }
    p { color: var(--mu); font-size: 17px; line-height: 1.6; }
    .links { display: flex; gap: 26px; margin-top: auto; flex-wrap: wrap; }
    .links a { font-weight: 800; font-size: 15px; display: inline-flex; align-items: center; gap: 6px; color: var(--mu); }
    .links a:hover { color: var(--ac); }
    .soon { font-size: 14px; color: var(--mu2); font-style: italic; }
    .empty { color: var(--mu); grid-column: 1 / -1; text-align: center; padding: 40px 0; }
    .more { display: flex; justify-content: center; }
    @media (max-width: 820px) { .grid { grid-template-columns: 1fr; } .proj { padding: 24px; min-height: 0; } .sec { padding: 70px 0; } }
  `,
})
export class ProjectsComponent {
  protected store = inject(PortfolioStore);
  protected filter = signal(PROJECT_FILTER_ALL);
  protected limit = signal(4);
  protected filters = computed(() => projectFilters(this.store.projects()));
  protected shown = computed(() => filterProjects(this.store.projects(), this.filter()));
  protected visible = computed(() => this.shown().slice(0, this.limit()));

  protected pick(f: string): void {
    this.filter.set(f);
    this.limit.set(4);
  }

  protected initials(title: string): string {
    const words = title.replace(/[^A-Za-zÀ-ÿ0-9 ]/g, ' ').trim().split(/\s+/);
    return words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : title.slice(0, 2).toUpperCase();
  }
}

/* ------------------------------ Contact ------------------------------- */

@Component({
  selector: 'app-contact',
  imports: [IconComponent, RevealDirective],
  template: `
    <section id="contact" class="container sec">
      <div class="glow pl"></div>
      <div class="head" appReveal>
        <div class="eyebrow">— Contact —</div>
        <h2 class="h2">Travaillons <span class="gtx">ensemble</span></h2>
        <p>Un projet, une offre, une question ? Écrivez-moi directement.</p>
      </div>
      <div class="grid">
        @for (c of cards(); track c.label) {
          @if (c.href) {
            <a class="card hover item" [href]="c.href" [attr.target]="c.external ? '_blank' : null" rel="noopener" appReveal>
              <span class="ic"><app-icon [name]="c.icon" [size]="24" [stroke]="1.8" /></span>
              <span class="lbl">{{ c.label }}</span>
              <span class="mono val">{{ c.value }}</span>
            </a>
          }
        }
      </div>
      @if (store.cvUrl(); as cv) {
        <div class="card hover cv" appReveal>
          <span class="pdf mono">PDF</span>
          <div class="cv-txt">
            <span class="lbl">Mon CV</span>
            <span class="val">Parcours, compétences et expériences{{ cvDate() ? ' · mis à jour le ' + cvDate() : '' }}</span>
          </div>
          <a class="btn btn-p" [href]="cv" [attr.download]="cvFileName()" target="_blank" rel="noopener">
            <app-icon name="download" [size]="18" [stroke]="2.2" />Télécharger mon CV
          </a>
        </div>
      }
    </section>
  `,
  styles: `
    .cv { position: relative; width: 100%; padding: 22px 26px; display: flex; align-items: center; gap: 20px; }
    .pdf { width: 52px; height: 64px; border-radius: 10px; background: var(--redbg); color: var(--red); display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px; font-size: 12px; font-weight: 600; flex-shrink: 0; transition: transform .4s cubic-bezier(.2,.7,.2,1); }
    .cv:hover .pdf { transform: rotate(-8deg) scale(1.08); }
    .cv-txt { flex-grow: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
    @media (max-width: 620px) { .cv { flex-direction: column; align-items: flex-start; } .cv .btn { width: 100%; } }
    .sec { position: relative; padding: 100px 0 120px; display: flex; flex-direction: column; align-items: center; gap: 44px; }
    .glow { width: 520px; height: 300px; left: calc(50% - 260px); top: 180px; opacity: .35; }
    .head { position: relative; display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; }
    .head p { font-size: 19px; color: var(--mu); }
    .grid { position: relative; width: 100%; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 22px; }
    .item { padding: 28px; display: flex; flex-direction: column; gap: 14px; color: var(--tx); }
    .item:hover { color: var(--tx); }
    .lbl { font-weight: 800; font-size: 19px; }
    .val { font-size: 13px; color: var(--mu); overflow-wrap: anywhere; }
    @media (max-width: 980px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 560px) { .grid { grid-template-columns: 1fr; } .sec { padding: 70px 0 90px; } }
  `,
})
export class ContactComponent {
  protected store = inject(PortfolioStore);
  protected cvDate = computed(() => {
    const t = this.store.settings().cvUpdatedAt;
    return t ? formatDate(t) : '';
  });
  /** Nom proposé au visiteur quand il enregistre le fichier. */
  protected cvFileName = computed(() => this.store.settings().cvFileName || 'CV-Prince-Henri-Junior-Pamousso.pdf');
  protected cards = computed(() => {
    const c = this.store.contacts();
    const l = this.store.links();
    return [
      { label: 'Email', icon: 'mail', href: l.email, value: c.email, external: false },
      { label: 'WhatsApp', icon: 'chat', href: l.whatsapp, value: c.whatsapp, external: true },
      { label: 'LinkedIn', icon: 'briefcase', href: l.linkedin, value: linkedinHandle(c.linkedin), external: true },
      { label: 'GitHub', icon: 'code', href: l.github, value: c.github, external: true },
    ];
  });
}

/* ------------------------------ Pied de page -------------------------- */

@Component({
  selector: 'app-footer',
  imports: [IconComponent],
  template: `
    <footer>
      <div class="container in">
        <div class="left"><span class="logo disp">PP<span>HJ</span></span>© {{ year }} Prince Henri Junior Pamousso</div>
        <div class="mid">
          @if (store.contacts().whatsapp) {
            <a [href]="store.links().whatsapp" target="_blank" rel="noopener">{{ store.contacts().whatsapp }}</a>
          }
          @if (store.contacts().email) {
            <a [href]="store.links().email">{{ store.contacts().email }}</a>
          }
        </div>
        <a class="ico" href="#accueil" aria-label="Revenir en haut"><app-icon name="up" [size]="18" [stroke]="2.2" /></a>
      </div>
    </footer>
  `,
  styles: `
    footer { border-top: 1px solid var(--line); }
    .in { min-height: 110px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; padding: 20px 0; color: var(--mu); font-size: 15px; }
    .left { display: flex; align-items: center; gap: 16px; }
    .logo { height: 40px; padding: 0 12px; border-radius: 11px; border: 1.5px solid var(--ac); display: flex; align-items: center; font-weight: 800; font-size: 14px; letter-spacing: .12em; color: var(--tx); }
    .logo span { color: var(--ac2); }
    .mid { display: flex; gap: 30px; flex-wrap: wrap; }
    .mid a { font-weight: 700; color: var(--tx); }
    .mid a:hover { color: var(--ac); }
  `,
})
export class FooterComponent {
  protected store = inject(PortfolioStore);
  protected year = new Date().getFullYear();
}
