import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Header } from '../../components/header/header';
import { IngredientInput } from '../../components/ingredient-input/ingredient-input';
import { IngredientList, ListedIngredient } from '../../components/ingredient-list/ingredient-list';

/**
 * Generator page, step 1: collect the ingredients the user has on hand.
 * Ships with example data matching the Figma reference (4 ingredients, an
 * open autocomplete for "Pas") purely so the layout can be verified — the
 * senior-dev pass replaces it with the real ingredient service and wires up
 * adding, editing and deleting.
 */
@Component({
  imports: [Header, RouterLink, IngredientInput, IngredientList],
  selector: 'app-generator',
  styleUrl: './generator.scss',
  templateUrl: './generator.html',
})
export class Generator {
  /** Example ingredients matching the Figma reference, newest first. */
  protected readonly ingredients: ListedIngredient[] = [
    { id: '1', name: 'Pasta', amount: 100, unit: 'gram' },
    { id: '2', name: 'Baby spinach', amount: 100, unit: 'gram' },
    { id: '3', name: 'Cherry tomatoes', amount: 150, unit: 'gram' },
    { id: '4', name: 'Egg', amount: 1, unit: 'piece' },
  ];

  /** Example autocomplete matches for the "Pas" query shown in the reference. */
  protected readonly suggestions = ['Pasta', 'Pastrami', 'Passionsfrut'];
}
