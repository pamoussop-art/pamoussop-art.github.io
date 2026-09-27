import { FirebaseApp, FirebaseOptions, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  DocumentData,
  DocumentSnapshot,
  FirestoreError,
  QueryDocumentSnapshot,
  QuerySnapshot,
  Firestore,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { Draft, EMPTY_SETTINGS, SiteSettings } from '../core/models';
import { AuthGateway, AuthUser, DataGateway, Repository, SettingsRepository } from '../core/ports';

export function firebaseApp(options: FirebaseOptions): FirebaseApp {
  return getApps()[0] ?? initializeApp(options);
}

class FirestoreRepository<T extends { id: string }> implements Repository<T> {
  constructor(
    private db: Firestore,
    private name: string,
  ) {}

  private ordered() {
    return query(collection(this.db, this.name), orderBy('order'));
  }

  private map(id: string, data: DocumentData): T {
    return { ...(data as Draft<T>), id } as T;
  }

  async list(): Promise<T[]> {
    const snap = await getDocs(this.ordered());
    return snap.docs.map((d: QueryDocumentSnapshot) => this.map(d.id, d.data()));
  }

  async create(data: Draft<T>): Promise<string> {
    const ref = await addDoc(collection(this.db, this.name), data as DocumentData);
    return ref.id;
  }

  async update(id: string, patch: Partial<Draft<T>>): Promise<void> {
    await updateDoc(doc(this.db, this.name, id), patch as DocumentData);
  }

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(this.db, this.name, id));
  }

  watch(cb: (items: T[]) => void, onError?: (e: unknown) => void): () => void {
    return onSnapshot(
      this.ordered(),
      (snap: QuerySnapshot) => cb(snap.docs.map((d: QueryDocumentSnapshot) => this.map(d.id, d.data()))),
      (err: FirestoreError) => onError?.(err),
    );
  }
}

function normalizeSettings(data: DocumentData | undefined): SiteSettings | null {
  if (!data) return null;
  return {
    ...EMPTY_SETTINGS,
    ...(data as Partial<SiteSettings>),
    contacts: { ...EMPTY_SETTINGS.contacts, ...((data['contacts'] as object) ?? {}) },
  };
}

class FirestoreSettings implements SettingsRepository {
  constructor(private db: Firestore) {}

  private ref() {
    return doc(this.db, 'settings', 'site');
  }

  async get(): Promise<SiteSettings | null> {
    const snap = await getDoc(this.ref());
    return snap.exists() ? normalizeSettings(snap.data()) : null;
  }

  async patch(patch: Partial<SiteSettings>): Promise<void> {
    await setDoc(this.ref(), patch as DocumentData, { merge: true });
  }

  watch(cb: (s: SiteSettings | null) => void, onError?: (e: unknown) => void): () => void {
    return onSnapshot(
      this.ref(),
      (snap: DocumentSnapshot) => cb(snap.exists() ? normalizeSettings(snap.data()) : null),
      (err: FirestoreError) => onError?.(err),
    );
  }
}

export function firestoreGateway(app: FirebaseApp): DataGateway {
  const db = getFirestore(app);
  return {
    skills: new FirestoreRepository(db, 'skills'),
    projects: new FirestoreRepository(db, 'projects'),
    services: new FirestoreRepository(db, 'services'),
    settings: new FirestoreSettings(db),
  };
}

export class FirebaseAuthGateway implements AuthGateway {
  private auth: Auth;

  constructor(app: FirebaseApp) {
    this.auth = getAuth(app);
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    const cred = await signInWithEmailAndPassword(this.auth, email.trim(), password);
    return { uid: cred.user.uid, email: cred.user.email };
  }

  signOut(): Promise<void> {
    return signOut(this.auth);
  }

  onChange(cb: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(this.auth, (u) => cb(u ? { uid: u.uid, email: u.email } : null));
  }
}
