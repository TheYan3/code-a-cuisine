import { Component, ElementRef, computed, model, input, output, viewChild } from '@angular/core';

import { Unit, UnitSelect } from '../unit-select/unit-select';

/**
 * "Add an ingredient" form: name field with an autocomplete dropdown, an
 * amount field and a unit picker, plus the add button. Presentational only
 * — `ingredientValue`/`amount`/`unit` are two-way bound form fields, the
 * autocomplete/unit-dropdown open state and the suggestion list are owned
 * by the parent and passed in, so this component has no state of its own
 * beyond the `focusName()` DOM helper.
 */
@Component({
  imports: [UnitSelect],
  selector: 'app-ingredient-input',
  styleUrl: './ingredient-input.scss',
  templateUrl: './ingredient-input.html',
})
export class IngredientInput {
  private readonly nameInput = viewChild.required<ElementRef<HTMLInputElement>>('nameInput');

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
  /**
   * Remainder of the highlighted suggestion, previewed dimmed right after the
   * typed text (e.g. "ta" while "Pas" is typed and "Pasta" is highlighted).
   * Empty string = no preview.
   */
  readonly ghostText = input('');
  /** Suggestion currently highlighted via arrow keys or mouse hover, if any. */
  readonly highlightedSuggestion = input<string | null>(null);

  /** `id` of the highlighted option, for `aria-activedescendant` on the combobox input. */
  protected readonly activeDescendantId = computed(() => {
    const highlighted = this.highlightedSuggestion();
    if (!highlighted) return null;
    const index = this.suggestions().indexOf(highlighted);
    return index >= 0 ? `ingredient-option-${index}` : null;
  });

  /** Emitted when a suggestion is clicked. */
  readonly suggestionSelected = output<string>();
  /** Emitted with the suggestion the mouse moved onto (hover highlight). */
  readonly suggestionHighlighted = output<string>();
  /** Emitted when the mouse leaves a hovered suggestion. */
  readonly suggestionHighlightCleared = output<void>();
  /** Emitted when the unit pill is clicked, or a unit option is picked (both flip `unitOpen`). */
  readonly unitToggle = output<void>();
  /** Emitted on a keydown in the name field (autocomplete navigation). */
  readonly nameKeydown = output<KeyboardEvent>();
  /**
   * Emitted when the form is submitted — via the add button or Enter in one
   * of its fields (skipped by the parent if a suggestion is highlighted,
   * see `nameKeydown`).
   */
  readonly add = output<void>();

  /** Moves focus to the ingredient name field (called by the parent after a successful add). */
  focusName(): void {
    this.nameInput().nativeElement.focus();
  }
}
