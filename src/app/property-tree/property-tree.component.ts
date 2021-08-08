import { Component, Input, OnInit } from '@angular/core';
import {
  FakerState,
  FakerStateBasicValue,
  FakerStateComplexValue,
  FakerStateProperty,
  FakerStateValue,
} from '../states/faker.state';

@Component({
  selector: 'app-property-tree',
  templateUrl: './property-tree.component.html',
  styleUrls: ['./property-tree.component.scss'],
})
export class PropertyTreeComponent implements OnInit {
  @Input('properties') properties: FakerStateProperty[] | FakerStateValue = [];
  @Input('parentPropertyId') parentPropertyId: string | null = null;
  @Input('isRootTree') isRootTree: boolean = true;

  constructor(public fakerState: FakerState) {}

  ngOnInit(): void {}

  getChildrenProperty(property: FakerStateProperty) {
    if (property.valueType.type === 'basic') {
      return [];
    }

    const complexType = <FakerStateComplexValue>property.valueType;

    return complexType.children;
  }

  onOpenPropertyDetail(e: Event, property: FakerStateProperty) {
    e.stopPropagation();

    if (property.valueType.type === 'basic') {
      return;
    }

    const isSimple = 'type' in property.valueType.children;
    if (isSimple) {
      return;
    }

    this.fakerState.toggleOpenProperty(property.id);
  }

  getProperties(
    properties: FakerStateProperty[] | FakerStateValue
  ): FakerStateProperty[] {
    const isSimple = 'type' in properties;
    const complexProperties = <FakerStateProperty[]>properties;
    return isSimple ? [] : complexProperties;
  }

  onDeleteProperty(e: Event, propertyId: string) {
    e.stopPropagation();
    this.fakerState.deleteProperty(propertyId);
  }

  getPropertyValue(property: FakerStateProperty) {
    try {
      if (property.valueType.type !== 'basic') {
        const complexProperty = <FakerStateComplexValue>property.valueType;
        const complexChildren = <FakerStateBasicValue>complexProperty.children;

        const complexValue =
          complexChildren.value.group + ':' + complexChildren.value.name;

        if (complexValue) {
          return complexValue;
        }
      } else {
        return (
          property.valueType.value.group + ': ' + property.valueType.value.name
        );
      }
    } catch (err) {
      // Its fine, we are probably working with object without direct value type
    }

    return null;
  }

  isBasicAdvancedCheck(property: FakerStateProperty) {
    const isBasic = property.valueType.type === 'basic';

    if (!isBasic) {
      if (property.valueType.type === 'array') {
        const complexProperty = <FakerStateComplexValue>property.valueType;
        const isSimple = 'type' in complexProperty.children;
        if (isSimple) {
          return true;
        }
      }
    }

    return isBasic;
  }

  onAddProperty(e: Event) {
    e.stopPropagation();

    this.fakerState.toggleSlideover(this.parentPropertyId);
  }
}
