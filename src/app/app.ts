import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Footer } from './components/footer/footer';

/**
 * Application shell. Each page brings its own header, so this only routes
 * to the page content; the footer (just the imprint link so far) is mounted
 * once here, outside `<router-outlet>`, so it's reachable from every route
 * without each page wiring it up itself.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
