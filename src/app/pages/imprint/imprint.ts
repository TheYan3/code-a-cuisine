import { Component } from '@angular/core';

import { Header } from '../../components/header/header';

/**
 * Imprint page. Will hold the legally required imprint text.
 */
@Component({
  imports: [Header],
  selector: 'app-imprint',
  styleUrl: './imprint.scss',
  templateUrl: './imprint.html',
})
export class Imprint {}
