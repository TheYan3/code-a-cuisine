import { Component, computed, input, output, signal } from '@angular/core';

/**
 * "Just finished this meal?" heart button from the recipe detail page (Figma
 * node "CTA giving a heart"). Purely presentational: it tracks only whether
 * *this visit* already clicked (to show the liked state and stop further
 * clicks) and emits `liked` once so the host page can persist the like —
 * writing it to Firebase is out of scope here.
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
  /** Like count as loaded for this recipe, before this visitor's click. */
  readonly count = input.required<number>();

  /** Fires once, the moment the visitor gives the heart. */
  readonly liked = output<void>();

  /** Whether this visitor already clicked — disables the button once true. */
  protected readonly clicked = signal(false);

  /** Count shown: the loaded count, +1 once this visitor has liked it. */
  protected readonly displayCount = computed(() => this.count() + (this.clicked() ? 1 : 0));

  /** Registers the like, once. */
  protected onClick(): void {
    if (this.clicked()) return;
    this.clicked.set(true);
    this.liked.emit();
  }
}
