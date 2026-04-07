import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  templateUrl: './page-layout.html',
  styleUrl: './page-layout.css'
})
export class PageLayout {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
