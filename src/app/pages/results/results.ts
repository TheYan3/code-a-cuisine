import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Header } from '../../components/header/header';

/** A single recipe card shown in the results grid. */
interface ResultRecipe {
  /** Route param for `/recipe/:id`. */
  id: string;
  /** Card number label, e.g. "Recipe 1". */
  number: string;
  /** Recipe title. */
  headline: string;
  /** Cooking time in minutes. */
  cookingTimeMinutes: number;
}

/**
 * Results page shown after a recipe request has been generated. Purely
 * presentational for now — the three recipes, the preference tags and the
 * hero text are static mock data; wiring this up to the real n8n/Firebase
 * result happens in a later, separate task.
 */
@Component({
  imports: [Header, RouterLink],
  selector: 'app-results',
  styleUrl: './results.scss',
  templateUrl: './results.html',
})
export class Results {
  /** Preference tags shown under the intro text. */
  protected readonly tags = ['Italian', 'Quick'];

  /** Mock recipes; card numbers and "Cooking time" spelled out consistently
   * (typos in the Figma text — "Recipie"/"Coocking" — fixed, like elsewhere
   * in the project, see `preferences.ts`). */
  protected readonly recipes: ResultRecipe[] = [
    {
      id: '1',
      number: 'Recipe 1',
      headline: 'Pasta with spinach and cherry tomatoes',
      cookingTimeMinutes: 20,
    },
    {
      id: '2',
      number: 'Recipe 2',
      headline: 'Creamy garlic shrimp pasta',
      cookingTimeMinutes: 22,
    },
    {
      id: '3',
      number: 'Recipe 3',
      headline: 'Pasta alla Trapanese (Sicilian Tomato Pesto)',
      cookingTimeMinutes: 20,
    },
  ];
}
