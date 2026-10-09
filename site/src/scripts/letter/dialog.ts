/** The window the form lives in, opened by every `[data-letter-open]` link and by the address `/#feedback`. */
export class LetterDialog {
  constructor(
    private readonly modal: HTMLDialogElement,
    /** A letter on its way keeps the window open: closing would look like giving up. */
    private readonly busy: () => boolean,
    private readonly onOpen: () => void,
  ) {
    document.querySelectorAll('[data-letter-open]').forEach((el) => el.addEventListener('click', (e) => this.open(e)));
    modal.querySelector('.letter-close')?.addEventListener('click', () => this.close());
    modal.addEventListener('cancel', (e) => {
      if (this.busy()) e.preventDefault();
    });
    modal.addEventListener('close', () => document.documentElement.classList.remove('letter-on'));
    // A click on the dimmed page around the window lands on the dialog itself.
    modal.addEventListener('mousedown', (e) => {
      if (e.target === modal) this.close();
    });
    if (window.location.hash === '#feedback') this.open();
  }

  open(e?: Event): void {
    e?.preventDefault();
    if (this.modal.open) return;
    this.onOpen();
    if (typeof this.modal.showModal === 'function') this.modal.showModal();
    else this.modal.setAttribute('open', '');
    document.documentElement.classList.add('letter-on');
  }

  close(): void {
    if (this.busy()) return;
    if (typeof this.modal.close === 'function') this.modal.close();
    else this.modal.removeAttribute('open');
  }

  scrollToTop(): void {
    this.modal.scrollTop = 0;
  }
}
