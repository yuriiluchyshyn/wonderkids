/**
 * Sending a letter to the game's API (`game/api/feedback.js`): the text first,
 * then the files in pieces, then the word that it is whole.
 */
import type { Attachment } from './attachments.ts';
import { PART } from './limits.ts';

export interface LetterText {
  kind: string;
  message: string;
  email: string;
  /** The hidden field only a robot fills in. */
  trap: string;
}

export interface Sent {
  /** The text arrived, but not every file did. */
  filesLost: boolean;
}

/** An answer of the API that names what went wrong (`message_too_short`, `too_many`, …). */
export class LetterError extends Error {}

interface Ticket {
  id?: number;
  token?: string;
}

const pause = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

function base64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export class LetterPost {
  constructor(private readonly endpoint: string) {}

  private async call(method: 'POST' | 'PUT', body: unknown): Promise<Ticket> {
    const res = await fetch(this.endpoint, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as Ticket & { error?: string };
    if (!res.ok) throw new LetterError(data.error || `http_${res.status}`);
    return data;
  }

  /** One piece of a file; a shaky connection gets two more tries. */
  private async sendPart(body: unknown): Promise<void> {
    for (let attempt = 0; ; attempt += 1) {
      try {
        await this.call('PUT', body);
        return;
      } catch (err) {
        const refused = err instanceof LetterError && (err.message === 'invalid_part' || err.message === 'invalid_token');
        if (attempt === 2 || refused) throw err;
        await pause(1500 * (attempt + 1));
      }
    }
  }

  private async upload(ticket: Ticket, files: readonly Attachment[], onProgress: (percent: number) => void): Promise<void> {
    const all = files.reduce((sum, file) => sum + file.blob.size, 0);
    let sent = 0;
    for (const [index, { blob }] of files.entries()) {
      for (let part = 0; part * PART < blob.size; part += 1) {
        const piece = blob.slice(part * PART, (part + 1) * PART);
        await this.sendPart({ id: ticket.id, token: ticket.token, file: index, part, data: await base64(piece) });
        sent += piece.size;
        onProgress(Math.round((sent / all) * 100));
      }
    }
  }

  async send(text: LetterText, files: readonly Attachment[], onProgress: (percent: number) => void): Promise<Sent> {
    const ticket = await this.call('POST', { ...text, files: files.map((file) => ({ name: file.name, type: file.type, size: file.blob.size })) });
    if (!ticket.id) return { filesLost: false };
    // The text is saved already; whatever happens to the files, the letter must still go.
    let filesLost = false;
    try {
      await this.upload(ticket, files, onProgress);
    } catch {
      filesLost = true;
    }
    await this.call('POST', { id: ticket.id, token: ticket.token, finish: true }).catch(() => undefined);
    return { filesLost };
  }
}
