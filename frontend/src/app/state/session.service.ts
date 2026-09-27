import { Injectable, inject, signal } from '@angular/core';
import { NOT_ADMIN_MESSAGE, authErrorMessage, isAuthorizedAdmin } from '../core/auth-errors';
import { AuthUser } from '../core/ports';
import { ADMIN_UID, AUTH } from '../infra/backend';

/** Session de l'administrateur (connexion / déconnexion). */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private auth = inject(AUTH);
  private adminUid = inject(ADMIN_UID);
  readonly user = signal<AuthUser | null>(null);
  readonly ready = signal(false);
  private readyPromise: Promise<AuthUser | null>;

  constructor() {
    this.readyPromise = new Promise((resolve) => {
      this.auth.onChange((u) => {
        // Un compte qui n'est pas celui de l'admin est ignoré (et déconnecté).
        if (u && !isAuthorizedAdmin(u, this.adminUid)) {
          void this.auth.signOut();
          u = null;
        }
        this.user.set(u);
        if (!this.ready()) {
          this.ready.set(true);
          resolve(u);
        }
      });
    });
  }

  /** Attend que l'état de connexion soit connu (utile au rechargement de la page). */
  async whenReady(): Promise<AuthUser | null> {
    await this.readyPromise;
    return this.user();
  }

  async signIn(email: string, password: string): Promise<string | null> {
    if (!email.trim() || !password) return 'Entre ton email et ton mot de passe.';
    try {
      const user = await this.auth.signIn(email, password);
      if (!isAuthorizedAdmin(user, this.adminUid)) {
        await this.auth.signOut();
        return NOT_ADMIN_MESSAGE;
      }
      return null;
    } catch (e) {
      return authErrorMessage(e);
    }
  }

  signOut(): Promise<void> {
    return this.auth.signOut();
  }
}
