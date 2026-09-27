import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AdminService } from '../src/app/core/admin-service';
import { DEMO_KEY, DemoBackend, KeyValueStore } from '../src/app/core/demo-storage';
import { MemoryUploader } from '../src/app/core/memory';

function fakeStorage(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

test('démo : une modification faite dans un onglet est retrouvée dans un autre onglet', async () => {
  const storage = fakeStorage();

  // Onglet 1 : l'admin
  const tab1 = new DemoBackend(storage);
  assert.equal(tab1.load(), false, 'rien de sauvegardé au départ');
  const admin = new AdminService(tab1.gateway, new MemoryUploader());
  await admin.seedIfEmpty();
  await admin.addSkill({ name: 'Kotlin', category: 'Mobile', icon: 'kotlin' });
  const react = (await tab1.skills.list()).find((s) => s.name === 'React')!;
  await admin.toggleSkill(react.id);
  await admin.updateContacts({
    email: 'nouveau@gmail.com',
    whatsapp: '+226 55 63 37 24',
    linkedin: 'linkedin.com/in/prince-henri-junior-pamousso-37a804342',
    github: 'pamoussop-art',
  });
  assert.ok(storage.data.has(DEMO_KEY));

  // Onglet 2 : le site public (nouvelle instance)
  const tab2 = new DemoBackend(storage);
  assert.equal(tab2.load(), true);
  const skills = await tab2.skills.list();
  assert.equal(skills.length, 29);
  assert.ok(skills.some((s) => s.name === 'Kotlin'));
  assert.equal(skills.find((s) => s.name === 'React')!.visible, false);
  assert.equal((await tab2.settings.get())!.contacts.email, 'nouveau@gmail.com');

  // Les identifiants restent uniques après rechargement.
  const admin2 = new AdminService(tab2.gateway, new MemoryUploader());
  const r = await admin2.addSkill({ name: 'Swift', category: 'Mobile' });
  assert.equal(r.ok, true);
  const ids = (await tab2.skills.list()).map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('démo : réinitialisation', () => {
  const storage = fakeStorage();
  const demo = new DemoBackend(storage);
  demo.save();
  demo.reset();
  assert.equal(storage.data.has(DEMO_KEY), false);
});

test('démo : stockage plein → pas de plantage', async () => {
  const full: KeyValueStore = { getItem: () => null, setItem: () => { throw new Error('QuotaExceededError'); }, removeItem: () => {} };
  const demo = new DemoBackend(full);
  const admin = new AdminService(demo.gateway, new MemoryUploader());
  const r = await admin.seedIfEmpty();
  assert.equal(r.ok, true);
});
