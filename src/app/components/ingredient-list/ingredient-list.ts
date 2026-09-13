import { Component, model, input, output } from '@angular/core';

import { Unit, UnitSelect } from '../unit-select/unit-select';

/** A single ingredient row as rendered by the list. */
export interface ListedIngredient {
  id: string;
  name: string;
  amount: number;
  unit: Unit;
}

/**
 * Collected ingredients box: a plain row per default, an edit row (amount +
 * unit + check/delete) for whichever ingredient matches `editingId`. No
 * state lives here — which row is being edited, the unit dropdown's open
 * state and the amount/unit being edited are all passed in and changed via
 * outputs, so the parent stays the single source of truth.
 */
@Component({
  imports: [UnitSelect],
  selector: 'app-ingredient-list',
  styleUrl: './ingredient-list.scss',
  templateUrl: './ingredient-list.html',
})
export class IngredientList {
  /** Ingredients to display, newest first. */
  readonly ingredients = input.required<ListedIngredient[]>();
  /** Id of the ingredient currently in edit mode, if any. */
  readonly editingId = input<string | null>(null);
  /** Whether the edit row's unit dropdown is expanded. */
  readonly editUnitOpen = input(false);
  /** Amount shown in the edit row's amount field. */
  readonly editAmount = model<number | null>(null);
  /** Unit shown in the edit row's unit field. */
  readonly editUnit = model<Unit>('gram');

  /** Emitted with the ingredient id when its edit icon is clicked. */
  readonly editStart = output<string>();
  /** Emitted with the ingredient id when its check (save) icon is clicked. */
  readonly editSave = output<string>();
  /** Emitted when Escape is pressed in the edit row, discarding the edit. */
  readonly editCancel = output<void>();
  /** Emitted with the ingredient id when its delete icon is clicked. */
  readonly deleteItem = output<string>();
  /** Emitted when the edit row's unit pill is clicked, or an option is picked (both flip `editUnitOpen`). */
  readonly editUnitToggle = output<void>();

  /**
   * Formats an ingredient's amount for display: "100g", "150ml", or just
   * the number for "piece" (e.g. "1 Egg" reads as "1" + "Egg").
   */
  protected formatAmount(item: ListedIngredient): string {
    if (item.unit === 'piece') {
      return `${item.amount}`;
    }
    const suffix = item.unit === 'gram' ? 'g' : 'ml';
    return `${item.amount}${suffix}`;
  }
}
