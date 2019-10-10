export enum ValidationCodes {
  Min = 'min',
  Max = 'max',
  Required = 'required',
  Ordering = 'ordering',
  SomeOrders = 'someOrders',
  RelationWithEntries = 'relationWithEntries',
}

class ZValidators {
  public static min(min: number) {
    return (value: any): boolean => value < min;
  }
}

interface ValidationError {
  message: string;
  code: ValidationCodes;
  data: { [key: string]: any };
}

// export class InvalidArgsError extends Error {
//
//   public constructor(message?: string) {
//     super(message);
//
//     // Set the prototype explicitly.
//     Object.setPrototypeOf(this, new.target.prototype);
//   }
// }
