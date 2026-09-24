import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** One entry of the rendered page list: a page number or a collapsed gap. */
type PageItem = number | 'ellipsis';

/**
 * Page number bar for a recipe list (`< 1 2 3 … 8 >`). Stateless: it only
 * renders links to `?page=N` on the current route (`queryParamsHandling:
 * 'merge'`, so it works under any parent path) and lets `withComponentInputBinding`
 * feed the resulting page back into the host page. Hides itself when there is
 * only one page.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-pagination',
  styleUrl: './pagination.scss',
  templateUrl: './pagination.html',
})
export class Pagination {
  /** 1-based page currently shown. */
  readonly currentPage = input.required<number>();
  /** Total number of pages. */
  readonly totalPages = input.required<number>();

  /** Previous page number, or `null` on the first page. */
  protected readonly previousPage = computed(() =>
    this.currentPage() > 1 ? this.currentPage() - 1 : null,
  );
  /** Next page number, or `null` on the last page. */
  protected readonly nextPage = computed(() =>
    this.currentPage() < this.totalPages() ? this.currentPage() + 1 : null,
  );

  /**
   * Page numbers to render, with runs of hidden pages collapsed into a
   * single `'ellipsis'` entry. Always keeps page 1, the last page, and the
   * current page with one neighbour on each side.
   */
  protected readonly items = computed<PageItem[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    const kept = new Set<number>([1, total, current - 1, current, current + 1]);
    const pages = [...kept].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);

    const result: PageItem[] = [];
    for (const page of pages) {
      const previous = result[result.length - 1];
      if (typeof previous === 'number' && page - previous > 1) result.push('ellipsis');
      result.push(page);
    }
    return result;
  });
}
