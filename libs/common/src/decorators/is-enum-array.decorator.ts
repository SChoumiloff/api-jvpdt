import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsEnumArray(options: ValidationOptions, enumObj: object) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEnumArray',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [enumObj],
      options: options,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [enumObj] = args.constraints;
          if (!Array.isArray(value)) {
            return false;
          }
          return value.every((item) => Object.values(enumObj).includes(item));
        },
      },
    });
  };
}