import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Minimal site-wide footer: fulfils the "a real navigation/footer will
 * follow" note that used to sit on `App`. Mounted once in `app.html`
 * outside `<router-outlet>`, so the imprint link it carries is reachable
 * from every route without each page wiring it up itself.
 *
 * No Figma frame covers this — every exported frame crops above the fold —
 * so it follows existing conventions instead of a design it doesn't have:
 * the `.fine-print` 14px floor from `src/styles/base/_typography.scss` and
 * the `touch-target` mixin other link-only controls (e.g. the header's
 * back link) already use.
 */
@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  styleUrl: './footer.scss',
  templateUrl: './footer.html',
})
export class Footer {}
