import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DEMO_MODE } from '../infra/backend';
import { IconComponent } from '../shared/icon.component';
import { SessionService } from '../state/session.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, IconComponent],
  template: `
    <div class="page">
      <div class="gridbg"></div>
      <div class="glow pl"></div>
      <a routerLink="/" class="back">← Retour au site</a>
      <form class="box" (ngSubmit)="submit()" novalidate autocomplete="off">
        <span class="logo disp">PP<span>HJ</span></span>
        <div class="head">
          <h1 class="disp">Espace administrateur</h1>
          <p>Connecte-toi pour gérer ton portfolio.</p>
        </div>
        @if (demo) {
          <p class="demo">Mode démo : n’importe quel email valide et un mot de passe de 6 caractères.</p>
        }
        <div class="field">
          <label for="email">Adresse email</label>
          <div class="wrap">
            <app-icon name="mail" [size]="19" />
            <input class="inp" id="email" name="email" type="email" autocomplete="off" [(ngModel)]="email" placeholder="ton@email.com" required />
          </div>
        </div>
        <div class="field">
          <label for="password">Mot de passe</label>
          <div class="wrap">
            <app-icon name="lock" [size]="19" />
            <input class="inp" id="password" name="password" [type]="showPw() ? 'text' : 'password'" autocomplete="new-password" [(ngModel)]="password" required />
            <button type="button" class="eye" (click)="showPw.set(!showPw())" [attr.aria-label]="showPw() ? 'Masquer le mot de passe' : 'Afficher le mot de passe'">
              <app-icon [name]="showPw() ? 'eyeOff' : 'eye'" [size]="19" />
            </button>
          </div>
        </div>
        @if (error()) {
          <p class="err" role="alert">{{ error() }}</p>
        }
        <button class="btn btn-p" type="submit" [disabled]="busy()">
          {{ busy() ? 'Connexion…' : 'Se connecter' }} <app-icon name="arrow" [size]="18" [stroke]="2.2" />
        </button>
        <p class="note">Accès réservé · aucune inscription possible</p>
      </form>
    </div>
  `,
  styles: `
    .page { min-height: 100vh; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; padding: 80px 20px; }
    .glow { width: 560px; height: 560px; left: calc(50% - 280px); top: calc(50% - 280px); }
    .back { position: absolute; left: 32px; top: 30px; font-weight: 700; z-index: 1; }
    .box { position: relative; width: min(480px, 100%); padding: 44px; background: var(--glass); backdrop-filter: blur(18px); border: 1px solid var(--line2); border-radius: 28px; display: flex; flex-direction: column; gap: 22px; box-shadow: 0 40px 80px -30px rgba(0,0,0,.5); animation: pop .8s cubic-bezier(.2,.7,.2,1) both; }
    .logo { align-self: flex-start; height: 52px; padding: 0 16px; border-radius: 14px; border: 1.5px solid var(--ac); display: flex; align-items: center; font-weight: 800; font-size: 17px; letter-spacing: .12em; box-shadow: 0 0 24px -6px var(--glow); }
    .logo span { color: var(--ac2); }
    .head { display: flex; flex-direction: column; gap: 8px; }
    h1 { font-size: 30px; font-weight: 700; }
    .head p, .note { color: var(--mu); }
    .note { text-align: center; font-size: 13px; }
    .demo { font: 600 13px 'JetBrains Mono', monospace; color: var(--warn); background: var(--warnbg); padding: 10px 12px; border-radius: 10px; }
    .wrap { position: relative; }
    .wrap > app-icon { position: absolute; left: 15px; top: 16px; color: var(--mu); }
    .wrap .inp { padding-left: 46px; padding-right: 46px; min-height: 54px; }
    .eye { position: absolute; right: 8px; top: 8px; width: 38px; height: 38px; border: 0; background: transparent; color: var(--mu); cursor: pointer; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .eye:hover { color: var(--tx); background: var(--acs); }
    @media (max-width: 520px) { .box { padding: 30px 22px; } .back { left: 20px; } }
  `,
})
export class LoginComponent {
  private session = inject(SessionService);
  private router = inject(Router);
  protected demo = inject(DEMO_MODE);
  protected email = '';
  protected password = '';
  protected busy = signal(false);
  protected error = signal<string | null>(null);
  protected showPw = signal(false);

  async submit(): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set(null);
    const err = await this.session.signIn(this.email, this.password);
    this.busy.set(false);
    this.password = '';
    if (err) {
      this.error.set(err);
      return;
    }
    await this.router.navigateByUrl('/admin');
  }
}
