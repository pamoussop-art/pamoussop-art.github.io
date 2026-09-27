import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../state/session.service';

// Important : inject() doit être appelé AVANT le premier « await ».

/** Pages admin : accessibles uniquement une fois connecté. */
export const adminGuard: CanActivateFn = async () => {
  const session = inject(SessionService);
  const router = inject(Router);
  const user = await session.whenReady();
  return user ? true : router.createUrlTree(['/admin/connexion']);
};

/** Page de connexion : redirige vers le tableau de bord si déjà connecté. */
export const loginGuard: CanActivateFn = async () => {
  const session = inject(SessionService);
  const router = inject(Router);
  const user = await session.whenReady();
  return user ? router.createUrlTree(['/admin']) : true;
};
