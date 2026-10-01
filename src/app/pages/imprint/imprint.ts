import { Component } from '@angular/core';

import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';

/**
 * Imprint contact details required by § 5 DDG. This repository is public,
 * so the real postal address is intentionally NOT committed — `street` and
 * `city` stay as clearly-marked placeholders in source control. Deployment
 * replaces both with the real values (outside this repo, e.g. as part of
 * `deploy.sh` or a build-time override) before the site goes live; `name`
 * and `email` are not sensitive and can stay as committed.
 *
 * Single source of truth: only this object holds imprint contact data, so
 * swapping the two placeholders at deploy time is a one-place edit instead
 * of hunting them through the template.
 */
export const IMPRINT_CONTACT = {
  name: 'Yannic Jundt',
  street: '[Street and number]',
  city: '[Postcode City]',
  email: 'yannic-jundt@gmx.de',
} as const;

/**
 * Imprint page: the legally required German "Impressum" (§ 5 DDG) plus a
 * short notice that this is a private training-course project and that
 * recipes are AI-generated without warranty.
 */
@Component({
  imports: [Footer, Header],
  selector: 'app-imprint',
  styleUrl: './imprint.scss',
  templateUrl: './imprint.html',
})
export class Imprint {
  protected readonly contact = IMPRINT_CONTACT;
}
