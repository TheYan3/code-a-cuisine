import { Component, input, output } from '@angular/core';

/**
 * Like count pill in the recipe header's tag row (Figma "Frame 935"), doubling
 * as a second like toggle next to the "Give it a heart" CTA. Like
 * `LikeButton` it is fully controlled by the host: it shows the `count` and
 * `isLiked` it is given and emits `toggled` on every press.
 *
 * Split out of `RecipeDetail` for the same reason as `LikeButton`: its
 * stylesheet sits right below the 10kB component-style budget.
 */
@Component({
  selector: 'app-like-pill',
  styleUrl: './like-pill.scss',
  templateUrl: './like-pill.html',
})
export class LikePill {
  /** Like count to display, fully owned by the host component. */
  readonly count = input.required<number>();
  /** Whether the heart renders filled (liked) or outlined (not liked). */
  readonly isLiked = input.required<boolean>();

  /** Fires on every press of the pill — the host decides between like and unlike. */
  readonly toggled = output<void>();
}
