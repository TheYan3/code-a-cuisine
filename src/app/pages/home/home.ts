import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Header } from '../../components/header/header';

/**
 * Landing page with the hero section: headline, primary call-to-action
 * (start the generator) and secondary call-to-action (browse the library).
 */
@Component({
  imports: [Header, RouterLink],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {}
