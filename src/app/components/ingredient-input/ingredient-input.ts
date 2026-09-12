import { Component, model, input, output } from '@angular/core';

import { Unit, UnitSelect } from '../unit-select/unit-select';

/**
 * "Add an ingredient" form: name field with an autocomplete dropdown, an
 * amount field and a unit picker, plus the add button. Presentational only
 * — `ingredientValue`/`amount`/`unit` are two-way bound form fields, the
 * autocomplete/unit-dropdown open state and the suggestion list are owned
 * by the parent and passed in, so this component has no state of its own.
 */
@Component({
  imports: [UnitSelect],
  selector: 'app-ingredient-input',
  styleUrl: './ingredient-input.scss',
  templateUrl: './ingredient-input.html',
})
export class IngredientInput {
  /** Text currently typed into the ingredient field. */
  readonly ingredientValue = model('');
  /** Amount typed into the serving size field. */
  readonly amount = model<number | null>(null);
  /** Currently selected unit. */
  readonly unit = model<Unit>('gram');

  /** Autocomplete matches for the current `ingredientValue`. */
  readonly suggestions = input<string[]>([]);
  /** Whether the autocomplete dropdown is expanded. */
  readonly autocompleteOpen = input(false);
  /** Whether the unit dropdown is expanded. */
  readonly unitOpen = input(false);

  /** Emitted when a suggestion is clicked. */
  readonly suggestionSelected = output<string>();
  /** Emitted when the closed unit pill is clicked. */
  readonly unitToggle = output<void>();
  /** Emitted when the add button is clicked. */
  readonly add = output<void>();
}
