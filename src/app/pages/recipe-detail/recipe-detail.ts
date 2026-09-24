import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Header } from '../../components/header/header';
import { LikeButton } from '../../components/like-button/like-button';
import { Recipe, RecipeIngredient } from '../../core/recipe';
import { RecipeApi } from '../../core/recipe-api';

/** Chef badge image per cook, in the colors the Figma design defines. */
const CHEF_BADGES = [
  '/icons/Chef%201.svg',
  '/icons/Chef%202.svg',
  '/icons/chef%203.svg',
  '/icons/chef%204.svg',
];

/**
 * Full view of a single recipe, reached from the results page and from the
 * library. Loads the recipe by its `:id` route parameter, so the page works
 * as a shared link without any state from the generator.
 */
@Component({
  imports: [Header, RouterLink, LikeButton],
  selector: 'app-recipe-detail',
  styleUrl: './recipe-detail.scss',
  templateUrl: './recipe-detail.html',
})
export class RecipeDetail implements OnInit {
  private readonly api = inject(RecipeApi);

  /** Firebase key of the recipe, bound from the `:id` route parameter. */
  readonly id = input<string>('');
  /**
   * Ids of the result set the visitor came from, passed along by the results
   * page. Present means "came from the generator", absent means "came from
   * the library" — that is what the back link points at.
   */
  readonly ids = input<string>('');

  /** The loaded recipe, `null` while loading and when the id is unknown. */
  protected readonly recipe = signal<Recipe | null>(null);
  /** True until the request settled, so the page does not flash "not found". */
  protected readonly loading = signal(true);

  /** Where the back link goes: the result set if we came from it, else the library. */
  protected readonly backLink = computed(() => (this.ids() ? '/generator/results' : '/library'));
  /** Label of the back link, matching its target. */
  protected readonly backLabel = computed(() => (this.ids() ? 'Recipe results' : 'Cookbook'));
  /** Query parameters the back link needs to restore the result set. */
  protected readonly backParams = computed<Record<string, string>>(() => {
    const ids = this.ids();
    const params: Record<string, string> = {};
    if (ids) params['ids'] = ids;
    return params;
  });

  /** One entry per cook, used to render the chef badges in the header. */
  protected readonly chefs = computed(() => {
    const recipe = this.recipe();
    return recipe ? Array.from({ length: recipe.helpers }, (_, i) => i + 1) : [];
  });

  /**
   * Loads the recipe. Runs in `ngOnInit`, not in the constructor: the router
   * binds route inputs with `setInput` on the already-created component, so
   * `id()` still holds its default at construction time.
   */
  ngOnInit(): void {
    this.api.byId(this.id()).subscribe({
      next: (recipe) => {
        this.recipe.set(recipe);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /**
   * The preferences the recipe was generated for, shown as pills next to the
   * nutrition table. "No preference" is left out — it says nothing.
   */
  protected tags(): string[] {
    const recipe = this.recipe();
    if (!recipe) return [];

    const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
    const tags = [capitalize(recipe.cuisine), capitalize(recipe.timeCategory)];
    if (recipe.diet !== 'no-preference') tags.push(capitalize(recipe.diet));

    return tags;
  }

  /** Badge image for a cook; cooks beyond the four designed badges reuse the last one. */
  protected chefBadge(chef: number): string {
    return CHEF_BADGES[Math.min(chef, CHEF_BADGES.length) - 1];
  }

  /**
   * Fired once by `app-like-button` when a visitor gives this recipe a
   * heart. Persisting the like (Firebase increment) is not built yet — this
   * is the hook point for it.
   */
  protected onLiked(): void {
    // ponytail: no persistence yet, phase C wires this to Firebase.
  }

  /** Renders an amount the way the design writes it: "80g", "30ml", "1 piece". */
  protected amount(ingredient: RecipeIngredient): string {
    switch (ingredient.unit) {
      case 'gram':
        return `${ingredient.amount}g`;
      case 'ml':
        return `${ingredient.amount}ml`;
      default:
        return `${ingredient.amount} ${ingredient.amount === 1 ? 'piece' : 'pieces'}`;
    }
  }
}
