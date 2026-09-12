import { Component, input, output } from '@angular/core';

/**
 * Minus/value/plus counter row used for "portions" and "helpers" on the
 * preferences page. Presentational only: bounds checking and the actual
 * value change happen in the parent, this component just disables the
 * buttons once `value` reaches `min`/`max` and emits intent.
 */
@Component({
  imports: [],
  selector: 'app-counter',
  styleUrl: './counter.scss',
  templateUrl: './counter.html',
})
export class Counter {
  /** Current count. */
  readonly value = input.required<number>();
  /** Lower bound (inclusive) — the minus button disables at this value. */
  readonly min = input.required<number>();
  /** Upper bound (inclusive) — the plus button disables at this value. */
  readonly max = input.required<number>();
  /** Unit label shown after the value, e.g. "Portions" or "Person". */
  readonly unitLabel = input.required<string>();

  /** Emitted when the minus button is clicked. */
  readonly decrement = output<void>();
  /** Emitted when the plus button is clicked. */
  readonly increment = output<void>();
}
