import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Header } from '../../components/header/header';
import { CUISINES } from '../../core/cuisine-meta';
import { Recipe } from '../../core/recipe';
import { RecipeApi } from '../../core/recipe-api';

/** Cards shown in the "Most liked recipes" strip, at most. */
const MAX_MOST_LIKED = 10;

/**
 * Library page: the public overview of every generated recipe, grouped into
 * the "Most liked recipes" strip and the six cuisine tiles that link to
 * `/library/:cuisine`.
 */
@Component({
  imports: [Header, RouterLink],
  selector: 'app-library',
  styleUrl: './library.scss',
  templateUrl: './library.html',
})
export class Library implements OnInit {
  private readonly api = inject(RecipeApi);

  /** Every stored recipe, newest first. Empty while loading or on error. */
  protected readonly recipes = signal<Recipe[]>([]);
  /** True until the request settles, so the most-liked strip does not flash empty. */
  protected readonly loading = signal(true);
  /** True when the request failed — shown instead of a silently empty strip. */
  protected readonly error = signal(false);

  /**
   * The most-liked recipes across every cuisine, highest like count first.
   * `recipes` is already newest-first from the API and `Array.sort` is
   * stable, so recipes tied on likes (0 included) keep that newest-first
   * order without any extra tie-break logic here.
   */
  protected readonly mostLiked = computed(() =>
    [...this.recipes()].sort((a, b) => b.likes - a.likes).slice(0, MAX_MOST_LIKED),
  );

  /** The six cuisine tiles, in the Figma order. */
  protected readonly cuisines = CUISINES;

  ngOnInit(): void {
    this.api.list().subscribe({
      next: (recipes) => {
        this.recipes.set(recipes);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }
}
