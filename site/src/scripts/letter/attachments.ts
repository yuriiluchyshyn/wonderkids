/** The photos and videos picked for a letter: what may be added, and the list the sender sees. */
import { ALLOWED, MAX_FILE, MAX_FILES, MAX_TOTAL, PHOTO_SIDE } from './limits.ts';
import { say, type Words } from './words.ts';

export interface Attachment {
  blob: Blob;
  name: string;
  type: string;
}

/** A big photo made smaller; anything else — and a photo that would not shrink — as it is. */
async function shrink(file: File): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || !('createImageBitmap' in window)) return file;
  try {
    const picture = await createImageBitmap(file);
    const k = Math.min(1, PHOTO_SIDE / Math.max(picture.width, picture.height));
    if (k === 1 && file.size < 1024 * 1024) return file;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(picture.width * k);
    canvas.height = Math.round(picture.height * k);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(picture, 0, 0, canvas.width, canvas.height);
    const small = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
    return small && small.size < file.size ? small : file;
  } catch {
    return file;
  }
}

export class Attachments {
  private files: Attachment[] = [];
  /** While a letter is on its way nothing may be taken out of it. */
  locked = false;

  constructor(
    private readonly list: HTMLElement,
    private readonly words: Words,
    private readonly onChange: () => void,
  ) {}

  get all(): readonly Attachment[] {
    return this.files;
  }

  get size(): number {
    return this.files.reduce((sum, file) => sum + file.blob.size, 0);
  }

  megabytes(size: number): string {
    return say(this.words.megabytes, { n: (size / 1024 / 1024).toFixed(1).replace('.', this.words.decimal) });
  }

  /** Adds a file; returns what is wrong with it, or `''` when it was taken. */
  async add(file: File): Promise<string> {
    const type = (file.type || '').toLowerCase();
    if (!ALLOWED.test(type)) return say(this.words.notMedia, { name: file.name });
    if (this.files.length >= MAX_FILES) return say(this.words.maxFiles, { max: MAX_FILES });
    const blob = await shrink(file);
    const name = blob === file ? file.name : `${file.name.replace(/\.[^.]*$/, '')}.jpg`;
    if (blob.size > MAX_FILE) return say(this.words.tooBig, { name: file.name, size: this.megabytes(blob.size) });
    if (this.size + blob.size > MAX_TOTAL) return say(this.words.noRoom, { name: file.name });
    // Shrinking took a while: another file may have taken the last place meanwhile.
    if (this.files.length >= MAX_FILES) return say(this.words.maxFiles, { max: MAX_FILES });
    this.files.push({ blob, name, type: blob.type || type });
    return '';
  }

  clear(): void {
    this.files = [];
    this.render();
  }

  render(): void {
    this.list.textContent = '';
    this.files.forEach((file, i) => {
      const name = document.createElement('span');
      name.textContent = file.name;
      const size = document.createElement('small');
      size.textContent = this.megabytes(file.blob.size);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = '✕';
      remove.setAttribute('aria-label', say(this.words.remove, { name: file.name }));
      remove.onclick = () => {
        if (this.locked) return;
        this.files.splice(i, 1);
        this.onChange();
        this.render();
      };
      const row = document.createElement('li');
      row.append(name, size, remove);
      this.list.appendChild(row);
    });
  }
}
