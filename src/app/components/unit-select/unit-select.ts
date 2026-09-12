import { Component, input, output } from '@angular/core';

/** Measurement unit an ingredient amount can be given in. */
export type Unit = 'gram' | 'ml' | 'piece';

/** Selectable units in display order, matching the Figma "measurements" component. */
export const UNITS: Unit[] = ['piece', 'ml', 'gram'];

/**
 * Unit dropdown pill ("gram" / "ml" / "piece") reused by the ingredient
 * input row and the ingredient list's edit mode. Purely presentational: the
 * `open` input controls whether the option list is shown, the parent owns
 * that state and reacts to the `toggle`/`select` outputs.
 */
@Component({
  imports: [],
  selector: 'app-unit-select',
  styleUrl: './unit-select.scss',
  templateUrl: './unit-select.html',
})
export class UnitSelect {
  /** Currently selected unit. */
  readonly unit = input.required<Unit>();
  /** Whether the option list is expanded. */
  readonly open = input(false);

  /** Emitted when the closed pill is clicked (parent toggles `open`). */
  readonly toggle = output<void>();
  /** Emitted with the picked unit when an option is clicked. */
  readonly select = output<Unit>();

  protected readonly units = UNITS;
}
