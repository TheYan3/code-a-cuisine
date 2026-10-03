import { Location, NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Site header showing the brand logo, linked to the home page, plus an
 * optional back link (e.g. the preferences step linking back to the
 * ingredient step). The logo color flips depending on the background it
 * sits on: `creme` for dark backgrounds (e.g. the green hero), `green` for
 * light ones. On desktop, without `backLink` the header is 88px tall; with
 * it, 136px — both fall out of the flex layout naturally, no fixed height
 * needed.
 *
 * Mobile (Figma "Menu bar mob.") shows the back link as a bare arrow (its
 * chip only appears while pressed) with no visible label — the label stays
 * in the DOM for accessibility and only becomes visible from the desktop
 * breakpoint up (Figma "Menu bar").
 * No real page instance in the Figma export ever shows the header's own
 * CTA button (it exists in the component library but is hidden on every
 * frame that uses it), so this component does not render one.
 */
@Component({
  imports: [NgTemplateOutlet, RouterLink],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  readonly variant = input<'creme' | 'green'>('green');
  /** Route to navigate back to. Omit to hide the back link entirely. */
  readonly backLink = input<string>();
  /** Label shown next to the back arrow (visible from the desktop breakpoint up). */
  readonly backLabel = input<string>();
  /** Query parameters the back link needs, e.g. the result set to return to. */
  readonly backQueryParams = input<Record<string, string>>({});
  /**
   * Adds the extra 8px of mobile bottom padding the Figma frames "Home"
   * and "Generate recipe" (step 1) carry below the logo. The other
   * logo-only mobile frames ("Loading", "Results") don't have it, even
   * though both groups equally omit the back link and button — the
   * export simply differs, so a flag carries the difference instead of
   * picking one value for both. No effect on desktop, where every frame
   * uses the same padding.
   */
  readonly spacious = input(false);
  /**
   * Makes the back link return to the page the visitor came from (browser
   * history) instead of `backLink`. `backLink` stays the fallback when the
   * page was opened directly, e.g. from a bookmark or another website.
   */
  readonly historyBack = input(false, { transform: booleanAttribute });

  private readonly location = inject(Location);
  /**
   * Whether an earlier in-app page exists to return to. The router numbers
   * its navigations in `history.state`; the first page loaded has id 1.
   */
  protected readonly canGoBack = (history.state?.navigationId ?? 1) > 1;

  /** Returns to the previous page in the browser history. */
  protected goBack(event: Event): void {
    event.preventDefault();
    this.location.back();
  }

  /** Path to the logo asset matching the current variant. */
  protected readonly logoSrc = computed(() =>
    this.variant() === 'creme' ? '/icons/Capa_2.svg' : '/icons/Capa_2_green.svg',
  );
}
