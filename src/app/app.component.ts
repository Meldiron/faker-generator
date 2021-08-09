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
  isCopyBadgeVisible = false;
  generatedJson: string | null = null;

  copiedTextAnimation: string | null = null;
  copeidTextAnimationTimeout: ReturnType<typeof setTimeout> | null = null;
  copyBadgeAnimationTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    public fakerState: FakerState,
    private fakerService: FakerService
  ) {}

  onEditArraySampleLength(e: Event) {
    const eventTarget = <HTMLInputElement>e.target;
    this.arraySampleLength = +eventTarget.value;
  }

  onGenerateJson(copyToClipboard: boolean) {
    this.generatedJson = JSON.stringify(
      this.fakerService.generateJson(this.arraySampleLength),
      null,
      4
    );

    if (copyToClipboard) {
      this.isCopyBadgeVisible = true;
      navigator.clipboard.writeText(this.generatedJson);

      if (this.copyBadgeAnimationTimeout) {
        clearTimeout(this.copyBadgeAnimationTimeout);
      }

      this.copyBadgeAnimationTimeout = setTimeout(() => {
        this.isCopyBadgeVisible = false;
      }, 1500);
    }
  }
}
