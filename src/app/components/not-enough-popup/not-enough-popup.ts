import { Component, ElementRef, effect, input, output, viewChild } from '@angular/core';

/** Gives every `NotEnoughPopup` instance a unique id prefix for its `aria-labelledby`/`-describedby`. */
let instanceCount = 0;

/**
 * Default headline (Figma copy). The mobile frame breaks this after "Ups!"
 * (`characters: "Ups! \nNot quite enough..."`), the desktop frame does not —
 * the template only applies that forced break while `title()` is still this
 * exact default; a custom title wraps naturally instead.
 */
const DEFAULT_TITLE = 'Ups! Not quite enough...';

/**
 * "Ups! Not quite enough..." warning dialog (Figma frames "pop-up" and
 * "mobile-pop-up"), meant for the moment the chosen ingredient quantities do
 * not cover the selected servings. Fully controlled by the host through
 * `open` — e.g. a `showNotEnough` signal the host flips once it has actually
 * checked the quantities; this component only renders the dialog shell.
 * Title/message/action label default to the Figma copy but stay overridable
 * so the same shell could carry a different warning later.
 *
 * Built on the native `<dialog>` element: `showModal()` gives the top-layer
 * stacking, the focus trap, Escape-to-close, return-focus-on-close and the
 * `::backdrop` for free, so none of that needs reimplementing here.
 */
@Component({
  selector: 'app-not-enough-popup',
  styleUrl: './not-enough-popup.scss',
  templateUrl: './not-enough-popup.html',
})
export class NotEnoughPopup {
  /** Whether the dialog should be open. Owned by the host (e.g. a `showNotEnough` signal). */
  readonly open = input.required<boolean>();
  /** Dialog headline. Defaults to the Figma copy. */
  readonly title = input(DEFAULT_TITLE);
  /** Exposed for the template's default-headline check (see `DEFAULT_TITLE`). */
  protected readonly defaultTitle = DEFAULT_TITLE;
  /** Dialog body text. Defaults to the Figma copy. */
  readonly message = input(
    'It looks like some ingredient quantities aren’t sufficient for your selected servings. Please add or adjust quantities and try again.',
  );
  /** Label of the single action button. Defaults to the Figma copy. */
  readonly actionLabel = input('Go back to ingredients');

  /** Fires whenever the dialog closes, however it closed (X, Escape, backdrop click, action). */
  readonly closed = output<void>();
  /** Fires when the action button is pressed (right before the dialog closes). */
  readonly action = output<void>();

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly instanceId = `not-enough-popup-${instanceCount++}`;

  /** `id` of the headline, referenced by the dialog's `aria-labelledby`. */
  protected readonly titleId = `${this.instanceId}-title`;
  /** `id` of the body text, referenced by the dialog's `aria-describedby`. */
  protected readonly messageId = `${this.instanceId}-message`;

  constructor() {
    // Mirrors the `open` input onto the native dialog's own open state —
    // `showModal()`/`close()` are imperative APIs, there is no HTML
    // attribute binding for the modal (top-layer) variant.
    effect(() => {
      const dialog = this.dialogRef().nativeElement;
      if (this.open() && !dialog.open) {
        dialog.showModal();
      } else if (!this.open() && dialog.open) {
        dialog.close();
      }
    });
  }

  /** Runs the action, then closes (e.g. "Go back to ingredients"). */
  protected onAction(): void {
    this.action.emit();
    this.dialogRef().nativeElement.close();
  }

  /** X button: just closes. */
  protected onCloseClick(): void {
    this.dialogRef().nativeElement.close();
  }

  /**
   * Closes on a click outside the dialog's own box (the `::backdrop`).
   * Checking `event.target === dialog` alone would also fire for clicks that
   * land in the dialog's own padding — that padding is not covered by any
   * child element, so its target is the dialog too — closing the popup on a
   * press that visually landed inside the green card.
   */
  protected onDialogClick(event: MouseEvent): void {
    const dialog = this.dialogRef().nativeElement;
    const rect = dialog.getBoundingClientRect();
    const insideDialog =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!insideDialog) {
      dialog.close();
    }
  }

  /** Native `close` event: fires for the X button, Escape and backdrop clicks alike. */
  protected onNativeClose(): void {
    this.closed.emit();
  }
}
