// Bloque la mise en ligne tant que Firebase n'est pas configuré (sinon le site serait en mode démo).
import { readFileSync } from 'node:fs';

const env = readFileSync('src/environments/environment.ts', 'utf8');
const value = (key) => (env.match(new RegExp(key + ":\\s*'([^']*)'")) || [])[1] || '';
const missing = ['apiKey', 'projectId', 'adminUid'].filter((k) => !value(k));
if (missing.length) {
  console.error('\n⛔ Mise en ligne bloquée : Firebase n’est pas configuré (' + missing.join(', ') + ' vide).');
  console.error('   Remplis src/environments/environment.ts (voir README, étape 2).\n');
  process.exit(1);
}
if (!value('cloudName') || !value('uploadPreset')) {
  console.warn('\n⚠️  Cloudinary n’est pas configuré : l’envoi du CV et de la photo ne marchera pas en ligne (README, étape 3).\n');
}
console.log('✔ Configuration Firebase présente.');
