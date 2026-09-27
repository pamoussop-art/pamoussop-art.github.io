/**
 * CONFIGURATION — à remplir une seule fois (voir le guide README.md, étapes 2 et 3).
 *
 * Tant que « firebase.apiKey » est vide, le site tourne en MODE DÉMO :
 * les données sont en mémoire (perdues au rechargement) et l'admin accepte
 * n'importe quel email + un mot de passe de 6 caractères minimum.
 *
 * Ces clés ne sont pas secrètes : elles identifient ton projet. La sécurité est
 * assurée par les règles Firestore (backend/firestore.rules).
 */
export const environment = {
  firebase: {
    apiKey: 'AIzaSyC7g8FDDUfsaPydMtTPw69-uhoJHzOtzdE',
    authDomain: 'portfolio-pphj.firebaseapp.com',
    projectId: 'portfolio-pphj',
    storageBucket: 'portfolio-pphj.firebasestorage.app',
    messagingSenderId: '582111752533',
    appId: '1:582111752533:web:32bcae6a69f716c2d9bfdc',
  },
  /** UID du seul compte autorisé dans l'admin (Firebase > Authentication > Utilisateurs). */
  adminUid: 'viNhGzfGOTQmgu5dF86BC9Ipqxl1',
  cloudinary: {
    cloudName: 'e5c5sbtn',
    uploadPreset: 'portfolio',
  },
};
