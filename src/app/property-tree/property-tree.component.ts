import { Component, Input, OnInit } from '@angular/core';
import {
  FakerState,
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

  onOpenPropertyDetail(e: any, property: FakerStateProperty) {
    e.stopPropagation();

    if (property.valueType.type === 'basic') {
      return;
    }

    // @ts-ignore
    if (property.valueType.children.type) {
      return;
    }

    this.fakerState.toggleOpenProperty(property.id);
  }

  getProperties(
    properties: FakerStateProperty[] | FakerStateValue
  ): FakerStateProperty[] {
    // @ts-ignore
    const isSimpleProperty = properties.type ? true : false;

    const complexProperties = <FakerStateProperty[]>properties;
    return isSimpleProperty ? [] : complexProperties;
  }

  onDeleteProperty(e: any, propertyId: string) {
    e.stopPropagation();
    this.fakerState.deleteProperty(propertyId);
  }

  getPropertyValue(property: FakerStateProperty) {
    try {
      if (property.valueType.type !== 'basic') {
        const complexProperty = <FakerStateComplexValue>property.valueType;

        const complexValue =
          // @ts-ignore
          complexProperty.children.value.group +
          ':' +
          // @ts-ignore
          complexProperty.children.value.name;

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
        // @ts-ignore
        if (complexProperty.children.type) {
          return true;
        }
      }
    }

    return isBasic;
  }

  onAddProperty(e: any) {
    e.stopPropagation();

    this.fakerState.toggleSlideover(this.parentPropertyId);
  }
}
