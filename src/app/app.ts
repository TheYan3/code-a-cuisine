import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Application shell. Each page brings its own header and footer (so both
 * sit on the page's own background), so this only routes to the page
 * content.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
