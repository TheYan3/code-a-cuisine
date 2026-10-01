import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';

/**
 * Landing page with the hero section: headline, primary call-to-action
 * (start the generator) and secondary call-to-action (browse the library),
 * with the legal links at the bottom left of the hero.
 */
@Component({
  imports: [Footer, Header, RouterLink],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {}
