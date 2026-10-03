import { Component, input, output } from '@angular/core';

/**
 * "Just finished this meal?" heart button from the recipe detail page (Figma
 * node "CTA giving a heart"). Fully controlled by the host: it shows exactly
 * the `count` and `isLiked` it is given and emits `toggled` on every press —
 * a press on the filled heart takes the like back. Persisting the change,
 * the optimistic count, and reverting on a failed write all live in
 * `RecipeDetail`, since only it knows whether the server write actually
 * succeeded.
 *
 * Split out of `RecipeDetail` instead of styled inline: `recipe-detail.scss`
 * already sits above the 4kB component-style budget, and that warning is
 * meant to stay rather than grow further.
 */
@Component({
  selector: 'app-like-button',
  styleUrl: './like-button.scss',
  templateUrl: './like-button.html',
})
export class LikeButton {
  /** Like count to display, fully owned by the host component. */
  readonly count = input.required<number>();
  /** Whether the heart renders filled (liked) or empty (not liked). */
  readonly isLiked = input.required<boolean>();

  /** Fires on every press of the heart — the host decides between like and unlike. */
  readonly toggled = output<void>();
}
