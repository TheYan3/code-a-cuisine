import { Component, computed, input, output, signal } from '@angular/core';

/** Measurement unit an ingredient amount can be given in. */
export type Unit = 'gram' | 'ml' | 'piece';

/** Selectable units in display order, matching the Figma "measurements" component. */
export const UNITS: Unit[] = ['piece', 'ml', 'gram'];

/** Gives every `UnitSelect` instance a unique id prefix — the page can render more than one. */
let instanceCount = 0;

/**
 * Unit dropdown pill ("gram" / "ml" / "piece") reused by the ingredient
 * input row and the ingredient list's edit mode. Presentational — the
 * `open` input controls whether the option list is shown, the parent owns
 * that state and reacts to the `toggle`/`select` outputs — except for the
 * arrow-key highlight while the list is open, which is purely a keyboard
 * affordance local to this component and never needs to be seen outside it.
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
  /** Option highlighted via arrow keys while the list is open; -1 = none. */
  protected readonly highlightedIndex = signal(-1);
  private readonly instanceId = `unit-select-${instanceCount++}`;

  /** `id` of the highlighted option, for `aria-activedescendant` on the trigger button. */
  protected readonly activeDescendantId = computed(() => {
    const index = this.highlightedIndex();
    return index >= 0 ? this.optionId(index) : null;
  });

  /** `id` for the option at `index`, shared between the list markup and `activeDescendantId`. */
  protected optionId(index: number): string {
    return `${this.instanceId}-option-${index}`;
  }

  /**
   * Keyboard handling for the trigger button: arrow keys move the highlight
   * while the list is open, Enter picks the highlighted option (native
   * button semantics already open/close it via click when nothing is
   * highlighted), Escape closes.
   */
  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (!this.open()) {
      this.highlightedIndex.set(-1);
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex.set(Math.min(this.highlightedIndex() + 1, this.units.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex.set(Math.max(this.highlightedIndex() - 1, 0));
        break;
      case 'Enter': {
        const index = this.highlightedIndex();
        if (index >= 0) {
          event.preventDefault();
          this.highlightedIndex.set(-1);
          this.select.emit(this.units[index]);
        }
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.highlightedIndex.set(-1);
        this.toggle.emit();
        break;
    }
  }
}
