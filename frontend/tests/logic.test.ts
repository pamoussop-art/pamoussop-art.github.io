import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeStats,
  contactLinks,
  deviconUrl,
  filterProjects,
  groupSkills,
  linkedinHandle,
  monogram,
  projectFilters,
  whatsappLink,
} from '../src/app/core/logic';
import { Project, Skill } from '../src/app/core/models';
import { SEED_PROJECTS, SEED_SETTINGS, SEED_SKILLS } from '../src/app/core/seed';

const skills: Skill[] = SEED_SKILLS.map((s, i) => ({ ...s, id: `s${i}` }));
const projects: Project[] = SEED_PROJECTS.map((p, i) => ({ ...p, id: `p${i}` }));

test('initiales des compétences sans logo', () => {
  assert.equal(monogram('Intelligence artificielle'), 'IA');
  assert.equal(monogram('Électronique'), 'EL');
  assert.equal(monogram('PWA'), 'PW');
  assert.equal(monogram('  '), '?');
});

test('compétences groupées dans l’ordre du site, « En apprentissage » en dernier', () => {
  const groups = groupSkills(skills);
  assert.deepEqual(
    groups.map((g) => g.category),
    ['Frontend', 'Backend', 'Mobile', 'Bases de données', 'Outils & DevOps', 'En apprentissage'],
  );
  assert.equal(groups.at(-1)!.learning, true);
  assert.equal(groups[0].skills[0].name, 'Angular');
});

test('une catégorie créée par l’admin apparaît avant « En apprentissage »', () => {
  const extra: Skill = { id: 'x', name: 'Arduino', category: 'Électronique embarquée', icon: '', visible: true, order: 1 };
  const groups = groupSkills([...skills, extra]);
  assert.deepEqual(groups.slice(-2).map((g) => g.category), ['Électronique embarquée', 'En apprentissage']);
});

test('compétences masquées exclues du site', () => {
  const hidden = skills.map((s) => (s.name === 'FileZilla' ? { ...s, visible: false } : s));
  const tools = groupSkills(hidden).find((g) => g.category === 'Outils & DevOps')!;
  assert.equal(tools.skills.some((s) => s.name === 'FileZilla'), false);
});

test('filtres de projets et filtrage', () => {
  assert.deepEqual(projectFilters(projects), ['Tous', 'Sites web', 'E-commerce', 'SaaS', 'En cours']);
  assert.equal(filterProjects(projects, 'Tous').length, 4);
  assert.deepEqual(filterProjects(projects, 'En cours').map((p) => p.title), ['EDUTECH', 'FASOGUARDIAN']);
  assert.deepEqual(filterProjects(projects, 'Sites web').length, 2);
  const hidden = projects.map((p) => (p.title === 'EDUTECH' ? { ...p, visible: false } : p));
  assert.deepEqual(filterProjects(hidden, 'En cours').map((p) => p.title), ['FASOGUARDIAN']);
});

test('chiffres affichés sur le site', () => {
  assert.deepEqual(computeStats(skills, projects, 2), { projects: 4, technologies: 25, years: 2 });
});

test('liens de contact', () => {
  const links = contactLinks(SEED_SETTINGS.contacts);
  assert.equal(links.whatsapp, 'https://wa.me/22655633724');
  assert.equal(links.email, 'mailto:pamoussop@gmail.com');
  assert.equal(links.github, 'https://github.com/pamoussop-art');
  assert.equal(whatsappLink(''), '');
  assert.equal(linkedinHandle(SEED_SETTINGS.contacts.linkedin), 'prince-henri-junior-pamousso');
});

test('URL des logos officiels', () => {
  assert.equal(deviconUrl('angular'), 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg');
  assert.equal(deviconUrl('django'), 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/django/django-plain.svg');
  assert.equal(deviconUrl(''), '');
});
