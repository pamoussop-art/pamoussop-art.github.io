import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isHttpUrl,
  normalizeGithub,
  normalizeUrl,
  parseTechList,
  validateContacts,
  validateFile,
  validateProject,
  validateService,
  validateSkill,
} from '../src/app/core/validation';
import { Skill } from '../src/app/core/models';

const angular: Skill = { id: 's1', name: 'Angular', category: 'Frontend', icon: 'angular', visible: true, order: 1 };

test('compétence : nom et catégorie obligatoires', () => {
  const r = validateSkill({ name: '  ', category: '' }, []);
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.ok(r.errors['name']);
    assert.ok(r.errors['category']);
  }
});

test('compétence : doublon refusé sans tenir compte des majuscules', () => {
  const r = validateSkill({ name: 'angular', category: 'Frontend' }, [angular]);
  assert.equal(r.ok, false);
});

test('compétence : on peut garder son propre nom en modification', () => {
  const r = validateSkill({ name: 'Angular', category: 'Frontend' }, [angular], 's1');
  assert.equal(r.ok, true);
});

test('compétence : espaces nettoyés, logo mis en minuscules', () => {
  const r = validateSkill({ name: '  Kotlin   Multiplatform ', category: 'Mobile', icon: ' Kotlin ' }, []);
  assert.deepEqual(r, { ok: true, value: { name: 'Kotlin Multiplatform', category: 'Mobile', icon: 'kotlin', visible: true } });
});

test('compétence : nom de logo invalide refusé', () => {
  const r = validateSkill({ name: 'X', category: 'Mobile', icon: 'mon logo!' }, []);
  assert.equal(r.ok, false);
});

test('projet : titre et description obligatoires', () => {
  const r = validateProject({ title: '', description: '' });
  assert.equal(r.ok, false);
  if (!r.ok) assert.deepEqual(Object.keys(r.errors).sort(), ['description', 'title']);
});

test('projet : liens complétés avec https et technos dédoublonnées', () => {
  const r = validateProject({
    title: 'EDUTECH',
    description: 'Site e-commerce.',
    repoUrl: 'github.com/pamoussop-art/edutech',
    demoUrl: '',
    tech: 'Angular, spring, angular',
    status: 'en-cours',
  });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.value.repoUrl, 'https://github.com/pamoussop-art/edutech');
    assert.equal(r.value.demoUrl, '');
    assert.deepEqual(r.value.tech, ['angular', 'spring']);
    assert.equal(r.value.status, 'en-cours');
  }
});

test('projet : lien invalide refusé', () => {
  const r = validateProject({ title: 'A', description: 'B', demoUrl: 'pas un lien' });
  assert.equal(r.ok, false);
  if (!r.ok) assert.ok(r.errors['demoUrl']);
});

test('projet : plus de 10 technologies refusé', () => {
  const r = validateProject({ title: 'A', description: 'B', tech: 'a,b,c,d,e,f,g,h,i,j,k' });
  assert.equal(r.ok, false);
});

test('service : icône inconnue refusée', () => {
  const r = validateService({ title: 'A', description: 'B', icon: 'rocket' as never });
  assert.equal(r.ok, false);
});

test('contacts : valeurs réelles acceptées et normalisées', () => {
  const r = validateContacts({
    email: ' Pamoussop@Gmail.com ',
    whatsapp: '+226 55 63 37 24',
    linkedin: 'linkedin.com/in/prince-henri-junior-pamousso-37a804342',
    github: 'https://github.com/pamoussop-art/',
  });
  assert.deepEqual(r, {
    ok: true,
    value: {
      email: 'pamoussop@gmail.com',
      whatsapp: '+226 55 63 37 24',
      linkedin: 'https://linkedin.com/in/prince-henri-junior-pamousso-37a804342',
      github: 'pamoussop-art',
    },
  });
});

test('contacts : erreurs sur chaque champ invalide', () => {
  const r = validateContacts({ email: 'moi@', whatsapp: '123', linkedin: 'https://facebook.com/moi', github: 'nom invalide' });
  assert.equal(r.ok, false);
  if (!r.ok) assert.deepEqual(Object.keys(r.errors).sort(), ['email', 'github', 'linkedin', 'whatsapp']);
});

test('fichiers : CV en PDF de 5 Mo maximum', () => {
  assert.equal(validateFile({ name: 'cv.pdf', type: 'application/pdf', size: 300_000 }, 'cv'), null);
  assert.match(validateFile({ name: 'cv.docx', type: 'application/msword', size: 300_000 }, 'cv')!, /PDF/);
  assert.match(validateFile({ name: 'cv.pdf', type: 'application/pdf', size: 6 * 1024 * 1024 }, 'cv')!, /5 Mo/);
  assert.match(validateFile(null, 'cv')!, /Aucun/);
  assert.match(validateFile({ name: 'cv.pdf', type: 'application/pdf', size: 0 }, 'cv')!, /vide/);
});

test('fichiers : photo JPG/PNG/WEBP uniquement', () => {
  assert.equal(validateFile({ name: 'moi.jpg', type: 'image/jpeg', size: 200_000 }, 'photo'), null);
  assert.equal(validateFile({ name: 'moi.webp', type: 'image/webp', size: 200_000 }, 'photo'), null);
  assert.ok(validateFile({ name: 'moi.gif', type: 'image/gif', size: 200_000 }, 'photo'));
});

test('utilitaires de liens', () => {
  assert.equal(normalizeUrl('exemple.com'), 'https://exemple.com');
  assert.equal(normalizeUrl(''), '');
  assert.equal(isHttpUrl('https://exemple.com'), true);
  assert.equal(isHttpUrl('javascript:alert(1)'), false);
  assert.equal(normalizeGithub('@pamoussop-art'), 'pamoussop-art');
  assert.deepEqual(parseTechList(['Angular', ' ', 'angular', 'Spring']), ['angular', 'spring']);
});
