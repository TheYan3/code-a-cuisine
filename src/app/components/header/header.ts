import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Site header showing the brand logo, linked to the home page, plus an
 * optional back link (e.g. the preferences step linking back to the
 * ingredient step). The logo color flips depending on the background it
 * sits on: `creme` for dark backgrounds (e.g. the green hero), `green` for
 * light ones. Without `backLink` the header is 88px tall; with it, 136px —
 * both fall out of the flex layout naturally, no fixed height needed.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  readonly variant = input<'creme' | 'green'>('green');
  /** Route to navigate back to. Omit to hide the back link entirely. */
  readonly backLink = input<string>();
  /** Label shown next to the back arrow. */
  readonly backLabel = input<string>();

  /** Path to the logo asset matching the current variant. */
  protected readonly logoSrc = computed(() =>
    this.variant() === 'creme' ? '/icons/Capa_2.svg' : '/icons/Capa_2_green.svg',
  );
}
