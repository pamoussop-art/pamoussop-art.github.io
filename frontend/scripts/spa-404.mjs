// GitHub Pages ne connaît pas les routes Angular (/admin…).
// On copie index.html en 404.html pour qu'un lien direct vers /admin fonctionne.
import { copyFileSync, existsSync } from 'node:fs';

const dir = 'dist/portfolio/browser';
if (existsSync(`${dir}/index.html`)) {
  copyFileSync(`${dir}/index.html`, `${dir}/404.html`);
  console.log('404.html créé pour GitHub Pages.');
} else {
  console.error(`Build introuvable dans ${dir}.`);
  process.exit(1);
}
