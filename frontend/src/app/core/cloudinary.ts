import { FileUploader, UploadedFile } from './ports';
import { FileKind } from './validation';

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
}

type FetchFn = (url: string, init: { method: string; body: FormData }) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;

interface CloudinaryResponse {
  secure_url?: string;
  public_id?: string;
  bytes?: number;
  original_filename?: string;
  format?: string;
  error?: { message?: string };
}

/**
 * Envoi de fichiers vers Cloudinary (compte gratuit, préréglage « unsigned »).
 * Le CV part en type « raw » (PDF téléchargeable tel quel), la photo en « image ».
 */
export class CloudinaryUploader implements FileUploader {
  constructor(
    private config: CloudinaryConfig,
    private fetchFn: FetchFn = (url, init) => fetch(url, init),
  ) {}

  endpoint(kind: FileKind): string {
    const type = kind === 'cv' ? 'raw' : 'image';
    return `https://api.cloudinary.com/v1_1/${encodeURIComponent(this.config.cloudName)}/${type}/upload`;
  }

  async upload(file: Blob & { name: string }, kind: FileKind): Promise<UploadedFile> {
    const form = new FormData();
    form.append('file', file, file.name);
    form.append('upload_preset', this.config.uploadPreset);
    form.append('folder', kind === 'cv' ? 'portfolio/cv' : 'portfolio/photo');

    let res;
    try {
      res = await this.fetchFn(this.endpoint(kind), { method: 'POST', body: form });
    } catch {
      throw new Error('Cloudinary est injoignable. Vérifie ta connexion internet.');
    }
    let body: CloudinaryResponse = {};
    try {
      body = (await res.json()) as CloudinaryResponse;
    } catch {
      /* réponse non JSON */
    }
    if (!res.ok || !body.secure_url) {
      const reason = body.error?.message ?? `code ${res.status}`;
      throw new Error(`Cloudinary a refusé le fichier (${reason}).`);
    }
    return {
      url: body.secure_url,
      publicId: body.public_id ?? '',
      bytes: body.bytes ?? file.size,
      fileName: file.name,
    };
  }
}
