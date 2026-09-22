import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';
import { GenerateRecipesResponse, QuotaStatus, Recipe } from './recipe';
import { RecipeRequest } from './recipe-request';

/**
 * Error body the generation webhook returns when a request is refused. A 400
 * carries `details`, a 429 carries the current `quota` — the loading page uses
 * that to tell "you are out of generations" apart from "something broke".
 */
export interface RecipeApiError {
  error: string;
  details?: string[];
  quota?: QuotaStatus;
}

/**
 * Talks to the two backends: the n8n webhooks for generating recipes and for
 * the remaining quota, and Firebase for reading stored recipes. Writing is not
 * offered on purpose — the database rules deny every client write, only the
 * n8n workflow stores recipes.
 */
@Injectable({ providedIn: 'root' })
export class RecipeApi {
  private readonly http = inject(HttpClient);

  /**
   * Generates three recipes from the request. Resolves once n8n has called the
   * model, verified the reply and stored the recipes, so this call stays open
   * for a while — the loading page exists for exactly that wait.
   *
   * Fails with status 400 when the request is rejected and 429 when the daily
   * quota is used up; both carry a `RecipeApiError` body.
   */
  generate(request: RecipeRequest): Observable<GenerateRecipesResponse> {
    return this.http.post<GenerateRecipesResponse>(environment.n8nWebhookUrl, request);
  }

  /** How many generations the visitor has left today (User Story 11). */
  quota(): Observable<QuotaStatus> {
    return this.http.get<QuotaStatus>(environment.n8nQuotaUrl);
  }

  /**
   * All stored recipes, newest first.
   *
   * Firebase returns an object keyed by id, and its REST API does not return
   * results in order even when asked to sort — so the key becomes the `id` and
   * the sorting happens here.
   */
  list(): Observable<Recipe[]> {
    return this.http
      .get<Record<string, Omit<Recipe, 'id'>> | null>(`${environment.firebaseUrl}/recipes.json`)
      .pipe(
        map((byId) =>
          Object.entries(byId ?? {})
            .map(([id, recipe]) => ({ id, ...recipe }))
            .sort((a, b) => b.createdAt - a.createdAt),
        ),
      );
  }

  /** A single recipe, or `null` when the id does not exist. */
  byId(id: string): Observable<Recipe | null> {
    return this.http
      .get<Omit<Recipe, 'id'> | null>(`${environment.firebaseUrl}/recipes/${id}.json`)
      .pipe(map((recipe) => (recipe ? { id, ...recipe } : null)));
  }
}
