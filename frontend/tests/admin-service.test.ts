import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AdminService } from '../src/app/core/admin-service';
import { MemoryUploader, memoryGateway } from '../src/app/core/memory';
import { DataGateway, FileUploader } from '../src/app/core/ports';

const pdf = (name = 'cv.pdf', size = 1000) => new File([new Uint8Array(size)], name, { type: 'application/pdf' });
const jpg = () => new File([new Uint8Array(500)], 'moi.jpg', { type: 'image/jpeg' });

async function setup(uploader: FileUploader = new MemoryUploader((f) => `https://cdn/${(f as File).name}`)) {
  const data: DataGateway = memoryGateway();
  let t = 1000;
  const admin = new AdminService(data, uploader, () => ++t);
  const seed = await admin.seedIfEmpty();
  assert.equal(seed.ok, true);
  return { data, admin };
}

test('import du contenu de départ, une seule fois', async () => {
  const { data, admin } = await setup();
  assert.equal((await data.skills.list()).length, 28);
  assert.equal((await data.services.list()).length, 6);
  assert.equal((await data.projects.list()).length, 4);
  assert.equal((await data.settings.get())!.contacts.email, 'pamoussop@gmail.com');
  const again = await admin.seedIfEmpty();
  assert.equal(again.ok && again.value.imported, false);
  assert.equal((await data.skills.list()).length, 28, 'aucun doublon');
});

test('compétence : ajouter, placée en fin de catégorie', async () => {
  const { data, admin } = await setup();
  const r = await admin.addSkill({ name: 'Kotlin', category: 'Mobile', icon: 'kotlin' });
  assert.equal(r.ok, true);
  const mobile = (await data.skills.list()).filter((s) => s.category === 'Mobile').sort((a, b) => a.order - b.order);
  assert.equal(mobile.at(-1)!.name, 'Kotlin');
  assert.equal(mobile.at(-1)!.order, 5);
});

test('compétence : doublon refusé avec message', async () => {
  const { admin } = await setup();
  const r = await admin.addSkill({ name: 'angular', category: 'Frontend' });
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.errors['name'], /existe déjà/);
});

test('compétence : modifier, changer de catégorie, masquer, supprimer', async () => {
  const { data, admin } = await setup();
  const next = (await data.skills.list()).find((s) => s.name === 'Next.js')!;
  const moved = await admin.updateSkill(next.id, { category: 'Frontend' });
  assert.equal(moved.ok, true);
  const after = (await data.skills.list()).find((s) => s.id === next.id)!;
  assert.equal(after.category, 'Frontend');
  assert.equal(after.order, 6, 'passe en fin de Frontend');

  const hide = await admin.toggleSkill(next.id);
  assert.equal(hide.ok && hide.value, false);
  assert.equal((await data.skills.list()).find((s) => s.id === next.id)!.visible, false);
  const show = await admin.toggleSkill(next.id);
  assert.equal(show.ok && show.value, true);

  const del = await admin.deleteSkill(next.id);
  assert.equal(del.ok, true);
  assert.equal((await data.skills.list()).some((s) => s.id === next.id), false);
  const again = await admin.deleteSkill(next.id);
  assert.equal(again.ok, false, 'suppression d’un élément déjà supprimé refusée proprement');
});

test('compétence : réordonner dans sa catégorie, bornes respectées', async () => {
  const { data, admin } = await setup();
  const react = (await data.skills.list()).find((s) => s.name === 'React')!;
  assert.equal((await admin.moveSkill(react.id, 'up')).ok, true);
  const front = (await data.skills.list()).filter((s) => s.category === 'Frontend').sort((a, b) => a.order - b.order);
  assert.deepEqual(front.slice(0, 2).map((s) => s.name), ['React', 'Angular']);
  const top = await admin.moveSkill(react.id, 'up');
  assert.equal(top.ok, false);
  assert.match(top.message, /première/);
  // Les autres catégories ne bougent pas.
  const back = (await data.skills.list()).filter((s) => s.category === 'Backend').sort((a, b) => a.order - b.order);
  assert.equal(back[0].name, 'Spring Boot');
});

test('projet : ajouter, modifier le statut, réordonner, supprimer', async () => {
  const { data, admin } = await setup();
  const add = await admin.addProject({ title: 'Portfolio', description: 'Ce site.', category: 'Sites web', tech: 'angular, firebase' });
  assert.equal(add.ok, true);
  const id = add.ok ? add.value : '';
  let p = (await data.projects.list()).find((x) => x.id === id)!;
  assert.equal(p.order, 5);
  assert.deepEqual(p.tech, ['angular', 'firebase']);
  assert.equal(p.status, 'termine');

  assert.equal((await admin.updateProject(id, { status: 'en-cours' })).ok, true);
  p = (await data.projects.list()).find((x) => x.id === id)!;
  assert.equal(p.status, 'en-cours');
  assert.equal(p.title, 'Portfolio', 'les autres champs sont conservés');

  assert.equal((await admin.moveProject(id, 'up')).ok, true);
  const order = (await data.projects.list()).sort((a, b) => a.order - b.order).map((x) => x.title);
  assert.deepEqual(order.slice(-2), ['Portfolio', 'FASOGUARDIAN']);

  const bad = await admin.updateProject(id, { demoUrl: 'n’importe quoi' });
  assert.equal(bad.ok, false);
  assert.equal((await admin.deleteProject(id)).ok, true);
  assert.equal((await data.projects.list()).length, 4);
});

test('service : ajouter, modifier, masquer, supprimer', async () => {
  const { data, admin } = await setup();
  const add = await admin.addService({ title: 'Formation', description: 'Cours Angular.', icon: 'idea' });
  assert.equal(add.ok, true);
  const id = add.ok ? add.value : '';
  assert.equal((await admin.updateService(id, { description: 'Cours Angular et Spring.' })).ok, true);
  assert.equal((await data.services.list()).find((s) => s.id === id)!.description, 'Cours Angular et Spring.');
  assert.equal((await admin.toggleService(id)).ok, true);
  assert.equal((await data.services.list()).find((s) => s.id === id)!.visible, false);
  assert.equal((await admin.deleteService(id)).ok, true);
  const empty = await admin.addService({ title: '', description: '' });
  assert.equal(empty.ok, false);
});

test('CV : charger, remplacer, supprimer', async () => {
  const { data, admin } = await setup();
  const first = await admin.replaceFile(pdf('cv-2025.pdf'), 'cv');
  assert.equal(first.ok, true);
  let s = (await data.settings.get())!;
  assert.equal(s.cvUrl, 'https://cdn/cv-2025.pdf');
  assert.equal(s.cvFileName, 'cv-2025.pdf');
  const firstDate = s.cvUpdatedAt;

  assert.equal((await admin.replaceFile(pdf('cv-2026.pdf'), 'cv')).ok, true);
  s = (await data.settings.get())!;
  assert.equal(s.cvUrl, 'https://cdn/cv-2026.pdf', 'le nouveau remplace l’ancien');
  assert.ok(s.cvUpdatedAt! > firstDate!);
  assert.equal(s.contacts.email, 'pamoussop@gmail.com', 'les contacts ne sont pas touchés');

  assert.equal((await admin.deleteFile('cv')).ok, true);
  s = (await data.settings.get())!;
  assert.equal(s.cvUrl, null);
  const again = await admin.deleteFile('cv');
  assert.equal(again.ok, false);
});

test('CV : mauvais format refusé sans rien envoyer', async () => {
  let calls = 0;
  const spy: FileUploader = { upload: async () => { calls++; throw new Error('ne doit pas être appelé'); } };
  const { admin } = await setup(spy);
  const r = await admin.replaceFile(jpg() as never, 'cv');
  assert.equal(r.ok, false);
  assert.equal(calls, 0);
});

test('CV : si l’envoi échoue, l’ancien CV reste en place', async () => {
  let fail = false;
  const flaky: FileUploader = {
    upload: async (f) => {
      if (fail) throw new Error('réseau coupé');
      return { url: 'https://cdn/ancien.pdf', publicId: 'a', bytes: f.size, fileName: f.name };
    },
  };
  const { data, admin } = await setup(flaky);
  await admin.replaceFile(pdf(), 'cv');
  fail = true;
  const r = await admin.replaceFile(pdf('nouveau.pdf'), 'cv');
  assert.equal(r.ok, false);
  assert.match(r.message, /échoué/);
  assert.equal((await data.settings.get())!.cvUrl, 'https://cdn/ancien.pdf');
});

test('photo : remplacer puis supprimer', async () => {
  const { data, admin } = await setup();
  assert.equal((await admin.replaceFile(jpg(), 'photo')).ok, true);
  assert.equal((await data.settings.get())!.photoUrl, 'https://cdn/moi.jpg');
  assert.equal((await admin.deleteFile('photo')).ok, true);
  assert.equal((await data.settings.get())!.photoUrl, null);
});

test('liens de contact : enregistrés après validation', async () => {
  const { data, admin } = await setup();
  const bad = await admin.updateContacts({ email: 'faux', whatsapp: '+226 55 63 37 24', linkedin: 'x', github: 'pamoussop-art' });
  assert.equal(bad.ok, false);
  assert.equal((await data.settings.get())!.contacts.email, 'pamoussop@gmail.com', 'rien n’est écrit si invalide');
  const ok = await admin.updateContacts({
    email: 'nouveau@gmail.com',
    whatsapp: '+226 70 00 00 00',
    linkedin: 'https://www.linkedin.com/in/prince-henri-junior-pamousso-37a804342',
    github: 'pamoussop-art',
  });
  assert.equal(ok.ok, true);
  const s = (await data.settings.get())!;
  assert.equal(s.contacts.email, 'nouveau@gmail.com');
  assert.equal(s.contacts.whatsapp, '+226 70 00 00 00');
});

test('droits refusés par la base : message clair', async () => {
  const { data, admin } = await setup();
  data.skills.create = async () => { throw { code: 'permission-denied' }; };
  const r = await admin.addSkill({ name: 'Rust', category: 'Backend' });
  assert.equal(r.ok, false);
  assert.match(r.message, /droits administrateur/);
});
