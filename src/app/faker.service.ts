import { Injectable } from '@angular/core';
import {
  FakerState,
  FakerStateBasicValue,
  FakerStateComplexValue,
  FakerStateProperty,
  FakerStateValue,
} from './states/faker.state';

export type JsonType = {
  [key: string]: any;
};

@Injectable({
  providedIn: 'root',
})
export class FakerService {
  constructor(private fakerState: FakerState) {}

  generateJson(arraySampleLength: number): JsonType {
    const fillJsonRecursion = (schema: FakerStateProperty[]): JsonType => {
      const resultObj: JsonType = {};

      for (const property of schema) {
        if (property.valueType.type === 'basic') {
          const simpleValueType = <FakerStateBasicValue>property.valueType;

          const executer =
            faker[simpleValueType.value.fakerGroup][
              simpleValueType.value.fakerName
            ];
          resultObj[property.name] = executer();
        } else {
          if (property.valueType.type === 'array') {
            resultObj[property.name] = [];

            const isSimple = 'type' in property.valueType.children;
            if (isSimple) {
              for (let i = 0; i < arraySampleLength; i++) {
                const simplePropetyChildren = <FakerStateBasicValue>(
                  property.valueType.children
                );
                const executer =
                  faker[simplePropetyChildren.value.fakerGroup][
                    simplePropetyChildren.value.fakerName
                  ];

                resultObj[property.name].push(executer());
              }
            } else {
              const children = <FakerStateProperty[]>(
                property.valueType.children
              );

              resultObj[property.name] = [];
              for (let i = 0; i < arraySampleLength; i++) {
                const childArr = fillJsonRecursion(children);
                resultObj[property.name].push(childArr);
              }
            }
          } else if (property.valueType.type === 'object') {
            const childObj = fillJsonRecursion(
              <FakerStateProperty[]>property.valueType.children
            );

            resultObj[property.name] = childObj;
          }
        }
      }

      return resultObj;
    };

    const generatedJson = fillJsonRecursion(
      this.fakerState.snapshot.properties
    );

    return generatedJson;
  }
}
