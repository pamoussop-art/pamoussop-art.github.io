import { InjectionToken, Provider, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AdminService } from '../core/admin-service';
import { CloudinaryUploader } from '../core/cloudinary';
import { DEMO_KEY, DemoBackend, KeyValueStore } from '../core/demo-storage';
import { MemoryAuth, MemoryUploader } from '../core/memory';
import { AuthGateway, DataGateway, FileUploader } from '../core/ports';
import { FirebaseAuthGateway, firebaseApp, firestoreGateway } from './firebase';

export const DATA = new InjectionToken<DataGateway>('DATA');
export const AUTH = new InjectionToken<AuthGateway>('AUTH');
export const UPLOADER = new InjectionToken<FileUploader>('UPLOADER');
/** true quand Firebase n'est pas encore configuré : données de démo dans le navigateur. */
export const DEMO_MODE = new InjectionToken<boolean>('DEMO_MODE');
/** UID de l'administrateur (null en démo : pas de restriction). */
export const ADMIN_UID = new InjectionToken<string | null>('ADMIN_UID');
/** Efface les données de démo (null hors démo). */
export const DEMO_RESET = new InjectionToken<(() => void) | null>('DEMO_RESET');

export const isFirebaseConfigured = (): boolean =>
  !!environment.firebase.apiKey && !!environment.firebase.projectId;

const isCloudinaryConfigured = (): boolean =>
  !!environment.cloudinary.cloudName && !!environment.cloudinary.uploadPreset;

/** Refuse clairement les envois tant que Cloudinary n'est pas configuré. */
const missingCloudinary: FileUploader = {
  upload: async () => {
    throw new Error('Cloudinary n’est pas encore configuré (voir le guide, étape 3).');
  },
};

function browserStorage(): KeyValueStore | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** En démo, le fichier est converti en texte pour être gardé dans le navigateur. */
function toDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Lecture du fichier impossible.'));
    reader.readAsDataURL(file);
  });
}

export function provideBackend(): Provider[] {
  if (!isFirebaseConfigured()) {
    const demo = new DemoBackend(browserStorage());
    const uploader = new MemoryUploader(toDataUrl);
    // Données déjà sauvegardées dans ce navigateur ? Sinon, on importe ton contenu réel.
    if (!demo.load()) void new AdminService(demo.gateway, uploader).seedIfEmpty();
    // Synchronise les onglets ouverts (admin ↔ site).
    window.addEventListener('storage', (e) => {
      if (e.key === DEMO_KEY) demo.load();
    });
    return [
      { provide: DEMO_MODE, useValue: true },
      { provide: DEMO_RESET, useValue: () => demo.reset() },
      { provide: ADMIN_UID, useValue: null },
      { provide: DATA, useValue: demo.gateway },
      { provide: AUTH, useValue: new MemoryAuth() },
      { provide: UPLOADER, useValue: uploader },
      { provide: AdminService, useFactory: () => new AdminService(inject(DATA), inject(UPLOADER)) },
    ];
  }
  const app = firebaseApp(environment.firebase);
  return [
    { provide: DEMO_MODE, useValue: false },
    { provide: DEMO_RESET, useValue: null },
    { provide: ADMIN_UID, useValue: environment.adminUid || null },
    { provide: DATA, useValue: firestoreGateway(app) },
    { provide: AUTH, useValue: new FirebaseAuthGateway(app) },
    {
      provide: UPLOADER,
      useValue: isCloudinaryConfigured() ? new CloudinaryUploader(environment.cloudinary) : missingCloudinary,
    },
    { provide: AdminService, useFactory: () => new AdminService(inject(DATA), inject(UPLOADER)) },
  ];
}
