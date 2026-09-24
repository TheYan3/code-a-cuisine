import { Component, input, output } from '@angular/core';

/**
 * "Just finished this meal?" heart button from the recipe detail page (Figma
 * node "CTA giving a heart"). Fully controlled by the host: it shows exactly
 * the `count` and `isLiked` it is given and emits `liked` once per press —
 * persisting the like, the optimistic +1, and reverting on a failed write
 * all live in `RecipeDetail`, since only it knows whether the server write
 * actually succeeded.
 *
 * Split out of `RecipeDetail` instead of styled inline: `recipe-detail.scss`
 * already sits above the 4kB component-style budget, and Yannic asked for
 * that warning to stay rather than grow it further.
 */
@Component({
  selector: 'app-like-button',
  styleUrl: './like-button.scss',
  templateUrl: './like-button.html',
})
export class LikeButton {
  /** Like count to display, fully owned by the host component. */
  readonly count = input.required<number>();
  /** Whether the heart should render (and stay) in its liked, disabled state. */
  readonly isLiked = input.required<boolean>();

  /** Fires when the visitor presses the heart — only possible while `isLiked()` is false. */
  readonly liked = output<void>();

  /** Emits `liked`, unless the heart is already given (or disabled while a write is in flight). */
  protected onClick(): void {
    if (this.isLiked()) return;
    this.liked.emit();
  }
}
