import { Component } from '@angular/core';
import { FakerService } from './faker.service';
import { FakerState, FakerStateProperty } from './states/faker.state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'faker-generator';

  monacoEditorOptions = { theme: 'vs', language: 'json' };

  arraySampleLength = 1;
  generatedJson: string | null = null;

  copiedTextAnimation: string | null = null;
  copeidTextAnimationTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    public fakerState: FakerState,
    private fakerService: FakerService
  ) {}

  onEditArraySampleLength(e: any) {
    this.arraySampleLength = +e.target.value;
  }

  onGenerateJson() {
    this.generatedJson = JSON.stringify(
      this.fakerService.generateJson(this.arraySampleLength),
      null,
      4
    );
  }
}
