/** Traduit les erreurs de connexion Firebase en messages clairs. */
export function authErrorMessage(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Adresse email invalide.';
    case 'auth/missing-password':
      return 'Entre ton mot de passe.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-login-credentials':
      return 'Email ou mot de passe incorrect.';
    case 'auth/user-disabled':
      return 'Ce compte a été désactivé.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Réessaie dans quelques minutes.';
    case 'auth/network-request-failed':
      return 'Pas de connexion internet.';
    default:
      return 'Connexion impossible. Réessaie.';
  }
}

/** Seul le compte dont l'UID est configuré peut entrer dans l'admin (null = pas de restriction, mode démo). */
export function isAuthorizedAdmin(user: { uid: string } | null, adminUid: string | null): boolean {
  if (!user) return false;
  return !adminUid || user.uid === adminUid;
}

export const NOT_ADMIN_MESSAGE = 'Ce compte n’a pas accès à l’administration.';
