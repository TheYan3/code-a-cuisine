import {
  Component,
  ElementRef,
  HostListener,
  inject,
  computed,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { Header } from '../../components/header/header';
import { IngredientInput } from '../../components/ingredient-input/ingredient-input';
import { IngredientList } from '../../components/ingredient-list/ingredient-list';
import { Unit } from '../../components/unit-select/unit-select';
import { INGREDIENT_SUGGESTIONS } from '../../core/ingredient-suggestions';
import { RecipeRequestService } from '../../core/recipe-request';

/** Cap on how many autocomplete matches are shown at once. */
const MAX_SUGGESTIONS = 3;

/**
 * Generator page, step 1: collect the ingredients the user has on hand.
 * Owns all interaction state for the ingredient form (typed value, unit,
 * autocomplete open/highlight, inline edit) and delegates the actual
 * ingredient list to the shared `RecipeRequestService`, which is what
 * `/generator/preferences` (and later n8n) reads from.
 */
@Component({
  imports: [Header, RouterLink, IngredientInput, IngredientList],
  selector: 'app-generator',
  styleUrl: './generator.scss',
  templateUrl: './generator.html',
})
export class Generator {
  protected readonly recipeRequest = inject(RecipeRequestService);

  private readonly ingredientInput = viewChild.required(IngredientInput);
  private readonly ingredientInputHost = viewChild.required(IngredientInput, { read: ElementRef });
  private readonly ingredientListHost = viewChild(IngredientList, { read: ElementRef });

  /** Text currently typed into the ingredient name field. */
  protected readonly nameValue = signal('');
  /** Amount currently typed into the serving size field. */
  protected readonly amountValue = signal<number | null>(null);
  /** Unit currently selected for the ingredient being added. */
  protected readonly unitValue = signal<Unit>('gram');
  /** Whether the autocomplete dropdown is open. */
  protected readonly autocompleteOpen = signal(false);
  /** Suggestion currently highlighted via arrow keys or mouse hover, if any. */
  protected readonly highlightedSuggestion = signal<string | null>(null);
  /** Whether the add form's unit dropdown is open. */
  protected readonly unitOpen = signal(false);

  /** Id of the ingredient row currently in edit mode, if any. */
  protected readonly editingId = signal<string | null>(null);
  /** Amount shown in the edit row's amount field. */
  protected readonly editAmount = signal<number | null>(null);
  /** Unit shown in the edit row's unit field. */
  protected readonly editUnit = signal<Unit>('gram');
  /** Whether the edit row's unit dropdown is open. */
  protected readonly editUnitOpen = signal(false);

  /**
   * Up to 3 autocomplete matches for the current name field: entries that
   * start with the typed text first, then entries that merely contain it.
   */
  protected readonly suggestions = computed(() => {
    const query = this.nameValue().trim().toLowerCase();
    if (!query) return [];

    const starts: string[] = [];
    const contains: string[] = [];
    for (const suggestion of INGREDIENT_SUGGESTIONS) {
      const lower = suggestion.toLowerCase();
      if (lower.startsWith(query)) starts.push(suggestion);
      else if (lower.includes(query)) contains.push(suggestion);
    }
    return [...starts, ...contains].slice(0, MAX_SUGGESTIONS);
  });

  /**
   * Preview text shown dimmed after the typed text while a suggestion is
   * highlighted — only when the suggestion actually starts with what was
   * typed, e.g. "Pas" + highlighted "Pastrami" -> "trami".
   */
  protected readonly ghostText = computed(() => {
    const highlighted = this.highlightedSuggestion();
    if (!highlighted) return '';
    const typed = this.nameValue();
    if (!highlighted.toLowerCase().startsWith(typed.toLowerCase())) return '';
    return highlighted.slice(typed.length);
  });

  /** Called on every keystroke in the name field: updates the value and reopens the dropdown. */
  protected onNameInput(value: string): void {
    this.nameValue.set(value);
    this.autocompleteOpen.set(true);
  }

  /** Handles arrow/enter/escape keys in the name field for autocomplete navigation. */
  protected onNameKeydown(event: KeyboardEvent): void {
    const options = this.suggestions();

    switch (event.key) {
      case 'ArrowDown': {
        if (options.length === 0) return;
        event.preventDefault();
        const index = options.indexOf(this.highlightedSuggestion() ?? '');
        this.highlightedSuggestion.set(options[Math.min(index + 1, options.length - 1)]);
        this.autocompleteOpen.set(true);
        break;
      }
      case 'ArrowUp': {
        if (options.length === 0) return;
        event.preventDefault();
        const index = options.indexOf(this.highlightedSuggestion() ?? '');
        this.highlightedSuggestion.set(options[Math.max(index - 1, 0)]);
        break;
      }
      case 'Escape':
        this.closeAutocomplete();
        break;
      case 'Enter': {
        const highlighted = this.highlightedSuggestion();
        if (highlighted) {
          // Only fill the field — adding still requires a separate `+`/Enter.
          event.preventDefault();
          this.selectSuggestion(highlighted);
        }
        // No highlight: fall through to the native form submission, which adds the ingredient.
        break;
      }
    }
  }

  /** Fills the name field with a suggestion (click, or Enter while highlighted). */
  protected selectSuggestion(value: string): void {
    this.nameValue.set(value);
    this.closeAutocomplete();
  }

  /** Highlights a suggestion on mouse hover, same as arrow-key navigation. */
  protected onSuggestionHighlighted(value: string): void {
    this.highlightedSuggestion.set(value);
  }

  /** Clears the hover highlight when the mouse leaves a suggestion. */
  protected onSuggestionHighlightCleared(): void {
    this.highlightedSuggestion.set(null);
  }

  private closeAutocomplete(): void {
    this.autocompleteOpen.set(false);
    this.highlightedSuggestion.set(null);
  }

  /** Toggles the add form's unit dropdown. */
  protected onUnitToggle(): void {
    this.unitOpen.set(!this.unitOpen());
  }

  /**
   * Adds the typed ingredient (button click or Enter without a highlighted
   * suggestion). Native `required`/`min`/`max`/`step` on the form fields
   * already block invalid submissions; this re-checks defensively and does
   * nothing if the name is blank after trimming or the amount is invalid.
   */
  protected onAddIngredient(): void {
    const name = this.nameValue().trim();
    const amount = this.amountValue();
    if (!name || amount === null || !Number.isInteger(amount) || amount < 1 || amount > 9999) {
      return;
    }

    this.recipeRequest.addIngredient(name, amount, this.unitValue());

    this.nameValue.set('');
    this.amountValue.set(null);
    this.closeAutocomplete();
    this.unitOpen.set(false);
    this.ingredientInput().focusName();
  }

  /** Enters edit mode for an ingredient, discarding any other row's unsaved edit. */
  protected onEditStart(id: string): void {
    const ingredient = this.recipeRequest.ingredients().find((i) => i.id === id);
    if (!ingredient) return;

    this.editingId.set(id);
    this.editAmount.set(ingredient.amount);
    this.editUnit.set(ingredient.unit);
    this.editUnitOpen.set(false);
  }

  /** Saves the edit row (check icon or Enter) if the amount is valid; otherwise does nothing. */
  protected onEditSave(id: string): void {
    const amount = this.editAmount();
    if (amount === null || !Number.isInteger(amount) || amount < 1 || amount > 9999) return;

    this.recipeRequest.updateIngredient(id, amount, this.editUnit());
    this.editingId.set(null);
    this.editUnitOpen.set(false);
  }

  /** Discards the current edit (Escape). */
  protected onEditCancel(): void {
    this.editingId.set(null);
    this.editUnitOpen.set(false);
  }

  /** Toggles the edit row's unit dropdown. */
  protected onEditUnitToggle(): void {
    this.editUnitOpen.set(!this.editUnitOpen());
  }

  /** Deletes an ingredient immediately, closing its edit row if it was open. */
  protected onDeleteIngredient(id: string): void {
    if (this.editingId() === id) {
      this.editingId.set(null);
    }
    this.recipeRequest.removeIngredient(id);
  }

  /** Closes the autocomplete and any open unit dropdown when clicking outside their card. */
  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;

    if (this.autocompleteOpen() || this.unitOpen()) {
      const host = this.ingredientInputHost().nativeElement;
      if (!host.contains(target)) {
        this.closeAutocomplete();
        this.unitOpen.set(false);
      }
    }

    if (this.editUnitOpen()) {
      const host = this.ingredientListHost()?.nativeElement;
      if (host && !host.contains(target)) {
        this.editUnitOpen.set(false);
      }
    }
  }
}
