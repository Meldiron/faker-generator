import { Component, OnInit } from '@angular/core';
import {
  FakerState,
  FakerStateBasicValue,
  FakerStateComplexValue,
  FakerStateOption,
  FakerStateProperty,
  FakerStateValue,
} from 'src/app/states/faker.state';

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
        (group) => group.fakerName === groupName
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

  onSubmitFormProperty() {
    if (this.fakerState.snapshot.editingProperty) {
      this.propertyName =
        this.propertyName || this.fakerState.snapshot.editingProperty.name;

      this.selectedType =
        this.selectedType ||
        this.getValueType(this.fakerState.snapshot.editingProperty);

      this.selectedValue =
        this.selectedValue ||
        this.getTypeGroup(
          'fakerName',
          this.fakerState.snapshot.editingProperty
        );

      this.selectedGroup =
        this.selectedGroup ||
        this.getTypeGroup(
          'fakerGroup',
          this.fakerState.snapshot.editingProperty
        );
    }

    if (!this.propertyName || !this.selectedType) {
      return;
    }

    if (this.selectedType === 'basic' || this.selectedType === 'array_basic') {
      if (!this.selectedGroup || !this.selectedValue) {
        return;
      }
    }

    if (!this.fakerState.snapshot.editingProperty) {
      // Create new property

      this.fakerState.addProperty(
        this.propertyName,
        <any>this.selectedType,
        this.selectedValue,
        this.selectedGroup
      );
    } else {
      // Edit property

      this.fakerState.editProperty(
        this.fakerState.snapshot.editingProperty.id,
        this.propertyName,
        <any>this.selectedType,
        this.selectedValue,
        this.selectedGroup
      );
    }

    this.selectedGroup = undefined;
    this.propertyName = undefined;
    this.selectedType = undefined;
    this.selectedValue = undefined;

    this.fakerState.toggleSlideover();
  }

  getValueType(property?: FakerStateProperty | null): string {
    if (!property) {
      return '';
    }

    if (property.valueType.type === 'array') {
      if ('type' in property.valueType.children) {
        return 'array_basic';
      } else {
        return 'array_object';
      }
    } else {
      return property.valueType.type;
    }
  }

  getTypeGroup(
    fakerKey: 'fakerName' | 'fakerGroup',
    property?: FakerStateProperty | null
  ): string {
    if (!property) {
      return '';
    }

    if (property.valueType.type === 'basic') {
      const basicState = <FakerStateBasicValue>property?.valueType;
      return basicState.value[fakerKey];
    } else {
      const complexType = <FakerStateComplexValue>property?.valueType;
      if ('value' in complexType.children) {
        return complexType.children.value[fakerKey];
      }
    }

    return '';
  }
}
