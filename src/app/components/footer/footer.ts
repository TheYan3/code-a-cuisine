import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Site footer with the two legal links (imprint, privacy policy). Like
 * `app-header`, every page places it itself — as the last element of its
 * full-bleed background wrapper — so the links sit at the bottom left on
 * the page's own background instead of in a separate strip below it; the
 * home page puts it inside the green hero.
 *
 * No Figma frame covers this — every exported frame crops above the fold —
 * so it follows existing conventions instead of a design it doesn't have:
 * the `.fine-print` 14px floor from `src/styles/base/_typography.scss`, a
 * 44px touch target and the header's left inset.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-footer',
  styleUrl: './footer.scss',
  templateUrl: './footer.html',
})
export class Footer {
  /** `creme` for the green pages, `muted` (grey) for light backgrounds. */
  readonly variant = input<'creme' | 'muted'>('muted');
}
