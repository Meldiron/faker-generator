import { Component, OnInit } from '@angular/core';
import { FakerState, FakerStateOption } from 'src/app/states/faker.state';

@Component({
  selector: 'app-property-slideover',
  templateUrl: './property-slideover.component.html',
  styleUrls: ['./property-slideover.component.scss'],
})
export class PropertySlideoverComponent implements OnInit {
  selectedType: string | undefined;
  selectedGroup: string | undefined;
  selectedValue: string | undefined;

  propertyName: string | undefined;

  constructor(public fakerState: FakerState) {}

  ngOnInit(): void {}

  getGroupOptions(groupName: string): FakerStateOption[] {
    return (
      this.fakerState.snapshot.fakerOptions.find(
        (group) => group.name === groupName
      )?.options || []
    );
  }

  onChangeType(e: Event) {
    this.selectedType = (<HTMLInputElement>e.target).value;
  }

  onChangeGroup(e: Event) {
    this.selectedGroup = (<HTMLInputElement>e.target).value;
  }

  onChangeValue(e: Event) {
    this.selectedValue = (<HTMLInputElement>e.target).value;
  }

  onChangeName(e: Event) {
    this.propertyName = (<HTMLInputElement>e.target).value;
  }

  onSubmitNewProperty() {
    if (!this.propertyName) {
      return;
    }

    this.fakerState.addProperty(
      this.propertyName,
      <any>this.selectedType,
      this.selectedValue,
      this.selectedGroup
    );

    this.selectedGroup = undefined;
    this.propertyName = undefined;
    this.selectedType = undefined;
    this.selectedValue = undefined;

    this.fakerState.toggleSlideover();
  }
}
