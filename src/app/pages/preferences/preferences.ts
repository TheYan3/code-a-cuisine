import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { Counter } from '../../components/counter/counter';
import { Header } from '../../components/header/header';
import { NotEnoughPopup } from '../../components/not-enough-popup/not-enough-popup';
import { Tag } from '../../components/tag/tag';
import { Cuisine, CookingTime, Diet, RecipeRequestService } from '../../core/recipe-request';

/** A cooking time option: a tag plus the sublabel shown underneath it. */
interface CookingTimeOption {
  value: CookingTime;
  label: string;
  sublabel: string;
}

/** A cuisine or diet option: a tag value plus its visible label. */
interface PreferenceOption<T extends string> {
  value: T;
  label: string;
}

/**
 * Generator page, step 2: cooking time, cuisine and diet preferences plus
 * portion/helper counters. Reads and writes the shared `RecipeRequestService`
 * directly — the counters and tags are presentational, this page owns the
 * mapping between their generic string values and the service's fixed
 * preference keys, plus the completeness check before "Generate a recipe"
 * does anything.
 */
@Component({
  imports: [Counter, Header, NotEnoughPopup, Tag],
  selector: 'app-preferences',
  styleUrl: './preferences.scss',
  templateUrl: './preferences.html',
})
export class Preferences {
  protected readonly recipeRequest = inject(RecipeRequestService);
  private readonly router = inject(Router);

  /**
   * Whether the "Ups! Not quite enough..." dialog (Figma frames "pop-up" /
   * "mobile-pop-up") is shown. Set by `onGenerate` when the chosen
   * ingredients don't add up to enough food for the chosen portions.
   */
  protected readonly showNotEnough = signal(false);

  /** Cooking time options; sublabels intentionally differ from the Figma text (typos fixed). */
  protected readonly cookingTimeOptions: CookingTimeOption[] = [
    { value: 'quick', label: 'Quick', sublabel: 'up to 20min' },
    { value: 'medium', label: 'Medium', sublabel: '20-45min' },
    { value: 'complex', label: 'Complex', sublabel: 'over 45min' },
  ];

  /** Cuisine options. */
  protected readonly cuisineOptions: PreferenceOption<Cuisine>[] = [
    { value: 'german', label: 'German' },
    { value: 'italian', label: 'Italian' },
    { value: 'indian', label: 'Indian' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'gourmet', label: 'Gourmet' },
    { value: 'fusion', label: 'Fusion' },
  ];

  /** Diet options. */
  protected readonly dietOptions: PreferenceOption<Diet>[] = [
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'keto', label: 'Keto' },
    { value: 'no-preference', label: 'No preferences' },
  ];

  /** Portions counter unit label, singular/plural depending on the value. */
  protected readonly portionsLabel = computed(() =>
    this.recipeRequest.portions() === 1 ? 'Portion' : 'Portions',
  );
  /** Helpers counter unit label, singular/plural depending on the value. */
  protected readonly helpersLabel = computed(() =>
    this.recipeRequest.helpers() === 1 ? 'Person' : 'Persons',
  );

  /** Applies a cooking time tag selection (value always comes from `cookingTimeOptions`). */
  protected onCookingTimeSelected(value: string): void {
    this.recipeRequest.cookingTime.set(value as CookingTime);
  }

  /** Applies a cuisine tag selection (value always comes from `cuisineOptions`). */
  protected onCuisineSelected(value: string): void {
    this.recipeRequest.cuisine.set(value as Cuisine);
  }

  /** Applies a diet tag selection (value always comes from `dietOptions`). */
  protected onDietSelected(value: string): void {
    this.recipeRequest.diet.set(value as Diet);
  }

  /**
   * Hands over to the loading page, which runs the generation. Does nothing
   * while the request is incomplete — at least one ingredient and all three
   * preference groups have to be chosen. Also does nothing, and shows the
   * "not quite enough" dialog instead, when the chosen ingredients don't add
   * up to enough food for the chosen number of portions.
   *
   * Arms the generation first: the loading page's guard only lets a run
   * through once per press, so a reload or a back navigation cannot spend a
   * second slot of the daily quota.
   */
  protected onGenerate(): void {
    if (!this.recipeRequest.isComplete()) return;
    if (!this.recipeRequest.hasEnoughFood()) {
      this.showNotEnough.set(true);
      return;
    }
    this.recipeRequest.armGeneration();
    this.router.navigate(['/generator/loading']);
  }

  /** Closes the "not enough" dialog (X button, Escape, or a backdrop click). */
  protected onNotEnoughClosed(): void {
    this.showNotEnough.set(false);
  }

  /** "Go back to ingredients": closes the dialog and returns to the ingredient step. */
  protected onNotEnoughAction(): void {
    this.showNotEnough.set(false);
    this.router.navigate(['/generator']);
  }
}
