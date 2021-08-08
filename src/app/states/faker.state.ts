import produce from 'immer';
import { NgxsDataRepository } from '@ngxs-labs/data/repositories';
import { DataAction, StateRepository } from '@ngxs-labs/data/decorators';
import { patch } from '@ngxs/store/operators';

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
    this.ctx.setState(
      produce(this.ctx.getState(), (draft) => {
        draft.isSlideoverOpened = !draft.isSlideoverOpened;

        if (draft.isSlideoverOpened && parentPropertyId !== undefined) {
          draft.parentPropertyId = parentPropertyId;
        }
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
    const parentPropertyId = state.parentPropertyId;

    const generateProperty = (): FakerStateProperty => {
      let valueType: FakerStateProperty['valueType'];

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
        const fakerValue = state.fakerOptions
          .find((fakerGroup) => fakerGroup.name === propertyGroupId)
          ?.options.find(
            (fakerOption) => fakerOption.name === propertyValueId
          ) || {
          name: 'Error',
          group: 'Error',
          fakerName: 'error',
          fakerGroup: 'error',
        };

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

      return {
        name: propertyName,
        id: `${propertyName}_${Date.now()}`,
        // id: propertyParentArr.join(';') + propertyName,
        isOpened: false,
        valueType: valueType,
      };
    };

    const addRecursive = (children: FakerStateProperty[]) => {
      for (const property of children) {
        if (property.valueType.type !== 'basic') {
          const isSimple = 'type' in property.valueType.children;
          if (!isSimple) {
            const propertyChildren = <FakerStateProperty[]>(
              property.valueType.children
            );
            addRecursive(propertyChildren);
          }
        }

        if (
          property.id !== parentPropertyId ||
          property.valueType.type === 'basic'
        ) {
          continue;
        }

        const isSimple = 'type' in property.valueType.children;
        if (isSimple) {
          continue;
        }

        const propertyChildren = <FakerStateProperty[]>(
          property.valueType.children
        );

        propertyChildren.push(generateProperty());
      }
    };

    this.ctx.setState(
      produce(state, (draft) => {
        if (parentPropertyId === null) {
          draft.properties.push(generateProperty());
        } else {
          addRecursive(draft.properties);
        }
      })
    );
  }

  @DataAction() deleteProperty(propertyId: string) {
    const deleteRecursive = (
      children: FakerStateProperty[]
    ): FakerStateProperty[] => {
      return children.filter((property) => {
        if (property.valueType.type !== 'basic') {
          const isSimple = 'type' in property.valueType.children;

          if (!isSimple) {
            property.valueType.children = deleteRecursive(
              <FakerStateProperty[]>property.valueType.children
            );
          }
        }

        if (property.id === propertyId) {
          return false;
        } else {
          return true;
        }
      });
    };

    this.ctx.setState(
      produce(this.ctx.getState(), (draft) => {
        draft.properties = deleteRecursive(draft.properties);
      })
    );
  }

  @DataAction() toggleOpenProperty(propertyId: string) {
    const updateRecursive = (children: FakerStateProperty[]) => {
      for (const property of children) {
        if (property.id === propertyId) {
          property.isOpened = !property.isOpened;
        }

        if (property.valueType.type !== 'basic') {
          const isSimple = 'type' in property.valueType.children;
          if (!isSimple) {
            const propertyChildren = <FakerStateProperty[]>(
              property.valueType.children
            );
            updateRecursive(propertyChildren);
          }
        }
      }
    };

    this.ctx.setState(
      produce(this.ctx.getState(), (draft) => {
        updateRecursive(draft.properties);
      })
    );
  }
}
