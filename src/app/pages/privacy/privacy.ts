import { Component } from '@angular/core';

import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { IMPRINT_CONTACT } from '../imprint/imprint';

/**
 * Privacy policy (GDPR Art. 13). Describes only what the code and the n8n
 * workflows in this repository actually do: hosting, recipe generation via
 * n8n and the Gemini API, the IP-based daily quota, Firebase storage, likes
 * and the browser storage the app uses. The controller's contact data comes
 * from {@link IMPRINT_CONTACT}, so the postal-address placeholders are
 * replaced at deploy time in one place for both legal pages.
 */
@Component({
  imports: [Footer, Header],
  selector: 'app-privacy',
  // ponytail: same text layout as the imprint, so its stylesheet is shared
  // instead of copied (the `legal-*` classes live there).
  styleUrl: '../imprint/imprint.scss',
  templateUrl: './privacy.html',
})
export class Privacy {
  protected readonly contact = IMPRINT_CONTACT;
}
