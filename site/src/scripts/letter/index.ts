/**
 * «Написати нам»: the text goes to the game's API; photos and videos follow in
 * pieces and reach the owner attached to an email.
 */
import { localGameOrigin } from '../portals.ts';
import { Attachments } from './attachments.ts';
import { LetterDialog } from './dialog.ts';
import { MIN_MESSAGE } from './limits.ts';
import { LetterError, LetterPost } from './post.ts';
import { readWords, say } from './words.ts';

interface LetterFields extends HTMLFormControlsCollection {
  kind: RadioNodeList;
  message: HTMLTextAreaElement;
  email: HTMLInputElement;
  topic: HTMLInputElement;
}

/** Where letters go: the address the page was built with, or the game's dev server beside this one. */
function endpointOf(form: HTMLFormElement): string {
  const built = new URL(form.dataset.api ?? '/api/feedback', window.location.href);
  const local = localGameOrigin();
  return local ? local + built.pathname : built.href;
}

export function wireLetterForm(): void {
  const form = document.querySelector<HTMLFormElement>('#letter');
  const modal = document.querySelector<HTMLDialogElement>('#letter-modal');
  const list = document.getElementById('letter-files');
  const note = document.getElementById('letter-note');
  const pick = document.querySelector<HTMLInputElement>('#letter-pick');
  const button = form?.querySelector<HTMLButtonElement>('button[type="submit"]');
  const done = document.getElementById('letter-done');
  const doneText = document.getElementById('letter-done-text');
  const words = readWords();
  if (!form || !modal || !list || !note || !pick || !button || !done || !doneText || !words) return;

  const fields = form.elements as LetterFields;
  const post = new LetterPost(endpointOf(form));
  const files = new Attachments(list, words, () => (note.textContent = ''));
  let sending = false;

  const refused: Record<string, string> = {
    message_too_short: words.tooShort,
    message_too_long: words.tooLong,
    invalid_email: words.badEmail,
    too_many: words.tooMany,
  };

  const showForm = (): void => {
    done.hidden = true;
    form.hidden = false;
  };
  const dialog = new LetterDialog(modal, () => sending, showForm);

  pick.addEventListener('change', async () => {
    const chosen = Array.from(pick.files ?? []);
    pick.value = '';
    const problems = new Set<string>();
    for (const file of chosen) {
      const problem = await files.add(file);
      if (problem) problems.add(problem);
    }
    note.textContent = [...problems].join(' ');
    files.render();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    const message = fields.message.value.trim();
    if (message.length < MIN_MESSAGE) {
      note.textContent = words.tooShort;
      fields.message.focus();
      return;
    }
    const email = fields.email.value.trim();
    sending = files.locked = true;
    button.disabled = true;
    button.textContent = words.sending;
    note.textContent = '';
    try {
      const { filesLost } = await post.send({ kind: fields.kind.value, message, email, trap: fields.topic.value }, files.all, (pct) => {
        button.textContent = say(words.sendingFiles, { pct });
      });
      doneText.textContent = filesLost ? words.filesLost : email ? words.willReply : words.thanks;
      form.reset();
      files.clear();
      form.hidden = true;
      done.hidden = false;
      dialog.scrollToTop();
    } catch (err) {
      note.textContent = (err instanceof LetterError && refused[err.message]) || words.failed;
    } finally {
      sending = files.locked = false;
      button.disabled = false;
      button.textContent = words.send;
    }
  });

  done.querySelector('button')?.addEventListener('click', () => {
    showForm();
    fields.message.focus();
  });
}
