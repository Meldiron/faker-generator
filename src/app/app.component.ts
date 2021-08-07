import { Component } from '@angular/core';
import { FakerState, FakerStateProperty } from './states/faker.state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'faker-generator';

  copiedTextAnimation: string | null = null;
  copeidTextAnimationTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(public fakerState: FakerState) {}
}
