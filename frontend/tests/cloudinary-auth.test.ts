import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CloudinaryUploader } from '../src/app/core/cloudinary';
import { authErrorMessage, isAuthorizedAdmin } from '../src/app/core/auth-errors';
import { MemoryAuth } from '../src/app/core/memory';

const pdf = new File([new Uint8Array(10)], 'cv.pdf', { type: 'application/pdf' });

test('Cloudinary : envoie le bon formulaire et lit la réponse', async () => {
  let seenUrl = '';
  let seenForm: FormData | null = null;
  const up = new CloudinaryUploader({ cloudName: 'demo-cloud', uploadPreset: 'portfolio' }, async (url, init) => {
    seenUrl = url;
    seenForm = init.body;
    return { ok: true, status: 200, json: async () => ({ secure_url: 'https://res.cloudinary.com/x/raw/upload/cv.pdf', public_id: 'portfolio/cv/abc', bytes: 10 }) };
  });
  const r = await up.upload(pdf, 'cv');
  assert.equal(seenUrl, 'https://api.cloudinary.com/v1_1/demo-cloud/raw/upload');
  assert.equal(seenForm!.get('upload_preset'), 'portfolio');
  assert.equal(seenForm!.get('folder'), 'portfolio/cv');
  assert.deepEqual(r, { url: 'https://res.cloudinary.com/x/raw/upload/cv.pdf', publicId: 'portfolio/cv/abc', bytes: 10, fileName: 'cv.pdf' });
  assert.equal(up.endpoint('photo'), 'https://api.cloudinary.com/v1_1/demo-cloud/image/upload');
});

test('Cloudinary : erreur lisible si le fichier est refusé', async () => {
  const up = new CloudinaryUploader({ cloudName: 'c', uploadPreset: 'p' }, async () => ({
    ok: false,
    status: 400,
    json: async () => ({ error: { message: 'Upload preset not found' } }),
  }));
  await assert.rejects(up.upload(pdf, 'cv'), /Upload preset not found/);
});

test('Cloudinary : erreur lisible hors connexion', async () => {
  const up = new CloudinaryUploader({ cloudName: 'c', uploadPreset: 'p' }, async () => {
    throw new TypeError('Failed to fetch');
  });
  await assert.rejects(up.upload(pdf, 'photo'), /injoignable/);
});

test('messages de connexion en français', () => {
  assert.equal(authErrorMessage({ code: 'auth/invalid-credential' }), 'Email ou mot de passe incorrect.');
  assert.match(authErrorMessage({ code: 'auth/too-many-requests' }), /Trop de tentatives/);
  assert.match(authErrorMessage(new Error('?')), /Connexion impossible/);
});

test('connexion démo : état notifié à la connexion et à la déconnexion', async () => {
  const auth = new MemoryAuth();
  const states: (string | null)[] = [];
  auth.onChange((u) => states.push(u?.email ?? null));
  await assert.rejects(auth.signIn('pas-un-email', '123456'));
  await auth.signIn('pamoussop@gmail.com', 'secret1');
  await auth.signOut();
  assert.deepEqual(states, [null, 'pamoussop@gmail.com', null]);
});

test('seul le compte administrateur est autorisé', () => {
  assert.equal(isAuthorizedAdmin({ uid: 'abc' }, 'abc'), true);
  assert.equal(isAuthorizedAdmin({ uid: 'intrus' }, 'abc'), false);
  assert.equal(isAuthorizedAdmin(null, 'abc'), false);
  assert.equal(isAuthorizedAdmin({ uid: 'demo-admin' }, null), true, 'mode démo : pas de restriction');
});
