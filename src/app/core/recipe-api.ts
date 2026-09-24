import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { GenerateRecipesResponse, QuotaStatus, Recipe } from './recipe';
import { RecipeRequest } from './recipe-request';

/**
 * How many times {@link RecipeApi.like} retries a like after Firebase
 * rejects the write because another visitor's like landed first (HTTP 412,
 * stale ETag) — a couple of quick retries clear a real race, more than that
 * points at something else being wrong.
 */
const LIKE_RETRY_LIMIT = 3;

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
 * the remaining quota, and Firebase for reading and — for the one field the
 * database rules allow, `likes` — writing stored recipes. Every other write
 * is refused by the rules; only the n8n workflow stores recipes.
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
            .map(([id, recipe]) => withLikes(id, recipe))
            .sort((a, b) => b.createdAt - a.createdAt),
        ),
      );
  }

  /** A single recipe, or `null` when the id does not exist. */
  byId(id: string): Observable<Recipe | null> {
    return this.http
      .get<Omit<Recipe, 'id'> | null>(`${environment.firebaseUrl}/recipes/${id}.json`)
      .pipe(map((recipe) => (recipe ? withLikes(id, recipe) : null)));
  }

  /**
   * Increments one recipe's `likes` counter by exactly 1 — the only write the
   * database rules allow from the client, and only when the new value is
   * exactly the old value plus 1. That is enforced with Firebase's ETag
   * concurrency control (see the Firebase REST API docs on conditional
   * requests): a GET with `X-Firebase-ETag: true` returns the current value
   * and its ETag, and the PUT carries that ETag in `if-match`. If another
   * visitor's like won the race, Firebase answers 412 and hands back the
   * fresh value and ETag in the same response — used here to retry without a
   * second GET, up to {@link LIKE_RETRY_LIMIT} times.
   *
   * Resolves with the new like count once the write is accepted.
   */
  like(id: string): Observable<number> {
    return this.likeAttempt(id, undefined, undefined, 0);
  }

  /**
   * One try of {@link like}. `current`/`etag` are only set on a retry, where
   * they come straight from the 412 response instead of a fresh GET.
   */
  private likeAttempt(
    id: string,
    current: number | undefined,
    etag: string | undefined,
    attempt: number,
  ): Observable<number> {
    const url = `${environment.firebaseUrl}/recipes/${id}/likes.json`;

    const current$ =
      etag !== undefined
        ? of({ value: current ?? 0, etag })
        : this.http
            .get<number | null>(url, {
              headers: { 'X-Firebase-ETag': 'true' },
              observe: 'response',
            })
            .pipe(
              map((response) => ({
                value: response.body ?? 0,
                etag: response.headers.get('ETag') ?? '',
              })),
            );

    return current$.pipe(
      switchMap(({ value, etag: currentEtag }) => {
        const next = value + 1;
        return this.http
          .put(url, next, { headers: { 'if-match': currentEtag }, responseType: 'text' })
          .pipe(
            map(() => next),
            catchError((error: HttpErrorResponse) => {
              if (error.status === 412 && attempt < LIKE_RETRY_LIMIT) {
                const freshEtag = error.headers.get('ETag') ?? undefined;
                const freshValue = typeof error.error === 'number' ? error.error : undefined;
                return this.likeAttempt(id, freshValue, freshEtag, attempt + 1);
              }
              return throwError(() => error);
            }),
          );
      }),
    );
  }
}

/** Fills in `id` and defaults a missing `likes` field to 0 — recipes stored before this field existed have none. */
function withLikes(id: string, recipe: Omit<Recipe, 'id'>): Recipe {
  return { id, ...recipe, likes: recipe.likes ?? 0 };
}
