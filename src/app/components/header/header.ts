import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Site header showing only the brand logo, linked to the home page.
 * The logo color flips depending on the background it sits on: `creme` for
 * dark backgrounds (e.g. the green hero), `green` for light ones.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  readonly variant = input<'creme' | 'green'>('green');

  /** Path to the logo asset matching the current variant. */
  protected readonly logoSrc = computed(() =>
    this.variant() === 'creme' ? '/icons/Capa_2.svg' : '/icons/Capa_2_green.svg',
  );
}
