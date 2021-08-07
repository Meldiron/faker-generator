declare const faker: any;

import { NgxsDataRepository } from '@ngxs-labs/data/repositories';
import { DataAction, StateRepository } from '@ngxs-labs/data/decorators';
import { patch, updateItem } from '@ngxs/store/operators';

import { Injectable } from '@angular/core';
import { State } from '@ngxs/store';

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export type FakerStateBasicValue = {
  type: 'basic';
  value: FakerStateOption;
};

export type FakerStateComplexValue = {
  type: 'array' | 'object';
  children: FakerStateProperty[] | FakerStateValue;
};

export type FakerStateValue = FakerStateBasicValue | FakerStateComplexValue;

export type FakerStateProperty = {
  name: string;
  id: string;
  valueType: FakerStateValue;
  isOpened: boolean;
};

export type FakerStateGroup = {
  name: string;
  fakerName: string;
  options: FakerStateOption[];
};

export type FakerStateOption = {
  name: string;
  group: string;

  fakerName: string;
  fakerGroup: string;
};

export interface FakerStateModel {
  parentPropertyId: string | null;
  properties: FakerStateProperty[];
  fakerOptions: FakerStateGroup[];
  isSlideoverOpened: boolean;
}

const allowedFakerGroups = [
  'address',
  'animal',
  'commerce',
  'company',
  'database',
  'datatype',
  'date',
  'finance',
  'git',
  'hacker',
  'helpers',
  'image',
  'internet',
  'lorem',
  'mersenne',
  'music',
  'name',
  'phone',
  'system',
  'time',
  'vehicle',
];

const fakerOptions: FakerStateGroup[] = [];
for (const fakerOptionGroup of allowedFakerGroups) {
  const options: FakerStateOption[] = [];

  const groupName = capitalizeFirstLetter(fakerOptionGroup)
    .replace(/([A-Z])/g, ' $1')
    .trim();

  for (const fakerOption of Object.getOwnPropertyNames(
    faker[fakerOptionGroup]
  )) {
    options.push({
      name: capitalizeFirstLetter(fakerOption)
        .replace(/([A-Z])/g, ' $1')
        .trim(),
      group: groupName,

      fakerName: fakerOption,
      fakerGroup: fakerOptionGroup,
    });
  }

  fakerOptions.push({
    name: groupName,
    options,
    fakerName: fakerOptionGroup,
  });
}

@StateRepository()
@State<FakerStateModel>({
  name: 'faker',
  defaults: {
    fakerOptions,
    properties: [],
    isSlideoverOpened: false,
    parentPropertyId: null,
  },
})
@Injectable({
  providedIn: 'root',
})
export class FakerState extends NgxsDataRepository<FakerStateModel> {
  @DataAction() toggleSlideover(parentPropertyId?: string | null) {
    const state = { ...this.ctx.getState() };

    const patchObj: any = {
      isSlideoverOpened: (oldVal: boolean) => !oldVal,
    };

    if (!state.isSlideoverOpened && parentPropertyId !== undefined) {
      patchObj['parentPropertyId'] = parentPropertyId;
    }

    this.ctx.setState(
      patch({
        ...patchObj,
      })
    );
  }

  @DataAction() addProperty(
    propertyName: string,
    propertyType: 'property' | 'array_basic' | 'array_object' | 'object',
    propertyValueId?: string,
    propertyGroupId?: string
  ) {
    const state = this.ctx.getState();

    const addPropertyRecursive = (
      propertyParentArr: string[],
      currentPropertyId: string | null,
      children: FakerStateProperty[]
    ): any => {
      // @ts-ignore
      if (!children || children.type) {
        return children;
      }

      const propertyArr: FakerStateProperty[] = [
        ...children.map((childrenProperty) => {
          return {
            ...childrenProperty,
            valueType: {
              ...childrenProperty.valueType,
              children: addPropertyRecursive(
                [...propertyParentArr, childrenProperty.id],
                childrenProperty.id,
                // @ts-ignore
                childrenProperty.valueType.children
              ),
            },
          };
        }),
      ];

      if (currentPropertyId === state.parentPropertyId) {
        let valueType: FakerStateProperty['valueType'];

        const fakerOptions: any = state.fakerOptions;

        if (propertyType === 'array_object') {
          valueType = {
            type: 'array',
            children: [],
          };
        } else if (propertyType === 'object') {
          valueType = {
            type: 'object',
            children: [],
          };
        } else {
          if (!propertyValueId || !propertyGroupId) {
            return;
          }

          const fakerValue = fakerOptions
            .find((o: any) => o.name === propertyGroupId)
            .options.find((o: any) => o.name === propertyValueId);

          if (propertyType === 'array_basic') {
            valueType = {
              type: 'array',
              children: {
                type: 'basic',
                value: fakerValue,
              },
            };
          } else {
            valueType = {
              type: 'basic',
              value: fakerValue,
            };
          }
        }

        propertyArr.push({
          name: propertyName,
          id: propertyParentArr.join(';') + propertyName,
          isOpened: false,
          valueType: valueType,
        });
      }

      return propertyArr;
    };

    console.log('New state', addPropertyRecursive([], null, state.properties));

    this.ctx.setState({
      ...state,
      properties: addPropertyRecursive([], null, state.properties),
      parentPropertyId: null,
    });
  }

  @DataAction() deleteProperty(propertyId: string) {
    const state = this.ctx.getState();

    const deleteItemRecursive = (children: FakerStateProperty[]): any => {
      // @ts-ignore
      if (!children || children.type) {
        return children;
      }

      return [
        ...children
          .filter((childrenProperty) => {
            return childrenProperty.id !== propertyId;
          })
          .map((childrenProperty) => {
            return {
              ...childrenProperty,
              valueType: {
                ...childrenProperty.valueType,
                children: deleteItemRecursive(
                  // @ts-ignore
                  childrenProperty.valueType.children
                ),
              },
            };
          }),
      ];
    };

    this.ctx.setState({
      ...state,
      properties: deleteItemRecursive(state.properties),
    });
  }

  @DataAction() toggleOpenProperty(propertyId: string) {
    const updateItemRecursive = (children: FakerStateProperty[]): any => {
      // @ts-ignore
      if (!children || children.type) {
        return children;
      }

      return [
        ...children.map((childrenProperty) => {
          return {
            ...childrenProperty,
            isOpened:
              childrenProperty.id === propertyId
                ? !childrenProperty.isOpened
                : childrenProperty.isOpened,
            valueType: {
              ...childrenProperty.valueType,
              children: updateItemRecursive(
                // @ts-ignore
                childrenProperty.valueType.children
              ),
            },
          };
        }),
      ];
    };

    const state = this.ctx.getState();

    this.ctx.setState({
      ...state,
      properties: updateItemRecursive(state.properties),
    });
  }
}
