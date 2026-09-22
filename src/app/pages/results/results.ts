import { Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';

import { Header } from '../../components/header/header';
import { Recipe } from '../../core/recipe';
import { RecipeApi } from '../../core/recipe-api';

/**
 * Results page: the three recipes that were just generated.
 *
 * The ids come from the query string rather than from shared state, so the
 * page survives a reload and can be shared as a link. Loading them back from
 * Firebase costs three reads and uses the same path the library and the detail
 * page use.
 */
@Component({
  imports: [Header, RouterLink],
  selector: 'app-results',
  styleUrl: './results.scss',
  templateUrl: './results.html',
})
export class Results implements OnInit {
  private readonly api = inject(RecipeApi);

  /** Comma-separated recipe ids, bound from `?ids=` by the router. */
  readonly ids = input<string>('');

  /** The loaded recipes, in the order their ids were given. */
  protected readonly recipes = signal<Recipe[]>([]);
  /** True until the recipes are there, so the page does not flash "nothing found". */
  protected readonly loading = signal(true);

  /**
   * Loads the recipes named in `?ids=`. Runs in `ngOnInit`, not in the
   * constructor: the router binds route inputs through `setInput` on the
   * already-created component, so `ids()` still holds its default at
   * construction time.
   */
  ngOnInit(): void {
    const ids = this.ids().split(',').filter(Boolean);

    if (!ids.length) {
      this.loading.set(false);
      return;
    }

    forkJoin(ids.map((id) => this.api.byId(id))).subscribe({
      next: (loaded) => {
        this.recipes.set(loaded.filter((recipe): recipe is Recipe => recipe !== null));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /**
   * The preferences the recipes were generated for, shown as tags under the
   * intro. Taken from the first recipe instead of the request state so a
   * shared link shows the right tags too.
   */
  protected tags(): string[] {
    const first = this.recipes()[0];
    if (!first) return [];

    const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
    const tags = [capitalize(first.cuisine), capitalize(first.timeCategory)];
    if (first.diet !== 'no-preference') tags.push(capitalize(first.diet));

    return tags;
  }
}
