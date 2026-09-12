import { Component, input, output } from '@angular/core';

/**
 * Single choice pill used to build preference groups (cooking time, cuisine,
 * diet). Renders as a native radio button so keyboard navigation and
 * single-selection-per-group work without any extra JavaScript — group
 * membership is controlled by the `name` input, exactly like a plain HTML
 * radio group. Active/hover/default styling comes from `:has(:checked)`
 * and `:hover` in CSS, no state is tracked in the component itself.
 */
@Component({
  imports: [],
  selector: 'app-tag',
  styleUrl: './tag.scss',
  templateUrl: './tag.html',
})
export class Tag {
  /** Name of the radio group this tag belongs to (one active tag per name). */
  readonly name = input.required<string>();
  /** Value submitted when this tag is selected. */
  readonly value = input.required<string>();
  /** Visible label text. */
  readonly label = input.required<string>();
  /** Whether this tag is the currently selected one in its group. */
  readonly checked = input(false);

  /** Emits this tag's value when the user selects it. */
  readonly selected = output<string>();
}
