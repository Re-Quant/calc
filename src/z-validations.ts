import {
  TradeInfoArgs,
  ETradeType,
  TradeOrderArg,
} from './models';

export interface ErrorInfo {
  message: string;
  actual?: number;
}

export type OrderError = {
  [key in keyof TradeOrderArg]?: ErrorInfo;
} & { entity?: ErrorInfo };

export interface TradeOrderErrors {
  [orderIndex: number]: OrderError;
}

export interface IsNumberOptions {
  allowNaN: boolean;
  allowInfinity: boolean;
}

export interface ValidationTradeErrors {
  tradeType?: ErrorInfo;
  deposit?: ErrorInfo;
  risk?: ErrorInfo;
  maxTradeVolumeQuoted?: ErrorInfo;
  leverage?: {
    allow?: ErrorInfo;
    max?: ErrorInfo;
  };
  breakeven?: {
    fee?: ErrorInfo;
  };

  entries?: TradeOrderErrors;
  stops?: TradeOrderErrors;
  takes?: TradeOrderErrors;
}

class ZValidationErrorFactory {
  /* eslint-disable max-len */
  public createErrorInfo<O extends ValidationTradeErrors, K1 extends keyof O>(keys: [K1], value: ErrorInfo, model: O): O[K1];
  public createErrorInfo<O extends ValidationTradeErrors, K1 extends keyof O, K2 extends keyof Required<O>[K1]>(keys: [K1, K2], value: ErrorInfo, model: O): O[K1][K2];
  public createErrorInfo<O extends ValidationTradeErrors, K1 extends keyof O, K2 extends keyof Required<O>[K1], K3 extends keyof Required<O>[K2]>(keys: [K1, K2, K3], value: ErrorInfo, model: O): O[K1][K2][K3];
  /* eslint-enable max-len */
  public createErrorInfo<O extends ValidationTradeErrors>(
    keys: string[],
    value: ErrorInfo,
    model: O,
  ): ValidationTradeErrors {
    let currentObject: any = model;

    // tslint:disable-next-line:forin
    for (const i in keys) {
      const key = keys[i];
      const length = keys.length - 1;

      if (+i === length) {
        currentObject[key] = value;
        break;
      }

      if (typeof currentObject[key] === 'undefined') {
        currentObject[key] = {};
      }

      currentObject = currentObject[key];
    }

    return model;
  }
}

// tslint:disable-next-line:max-classes-per-file
class ZValidations {
  public messages = {
    required: () => 'required field',
    number: () => 'should be a number',
    string: () => 'should be a string',
    boolean: () => 'should be a boolean',
    sumVolumeParts: () => 'should be equal \'1\'',
    minValue: (actual: number): string => `Value should be more then ${ actual }.`,
    maxValue: (actual: number): string => `Value should be less then ${ actual }.`,
    lessPrice: (actual: number, comperingPrice: number): string => `Price ${ actual } should be less then ${ comperingPrice }.`,
    biggerPrice: (actual: number, comperingPrice: number): string => `Price ${ actual } should be more then ${ comperingPrice }.`,
  };

  public zErrorFactory: ZValidationErrorFactory;

  constructor() {
    this.zErrorFactory = new ZValidationErrorFactory();
  }

  public isDefined(value: unknown): boolean {
    return value !== undefined && value !== null;
  }

  public isNumber(value: unknown, options: IsNumberOptions = {
    allowNaN: false,
    allowInfinity: false,
  }): boolean {
    if (typeof value !== 'number') {
      return false;
    }

    if (value === Infinity || value === -Infinity) {
      return options.allowInfinity;
    }

    if (Number.isNaN(value)) {
      return options.allowNaN;
    }

    return Number.isFinite(value);
  }

  public isBoolean(value: unknown): boolean {
    return value instanceof Boolean || typeof value === 'boolean';
  }

  public isString(value: unknown): boolean {
    return value instanceof String || typeof value === 'string';
  }

  public min(value: number, minValue: number): boolean {
    return value >= minValue;
  }

  public max(value: number, maxValue: number): boolean {
    return value <= maxValue;
  }

  public validateCommonFields(p: TradeInfoArgs): ValidationTradeErrors | void {
    const errors: ValidationTradeErrors = {} as any;
    // deposit
    if (!p.deposit && !this.isDefined(p.deposit)) {
      this.zErrorFactory.createErrorInfo(
        ['deposit'],
        {
          message: this.messages.required(),
        },
        errors,
      );
    }

    if (p.deposit && !this.isNumber(p.deposit)) {
      this.zErrorFactory.createErrorInfo(
        ['deposit'],
        {
          message: this.messages.number(),
        },
        errors,
      );
    }

    if (p.deposit && this.isNumber(p.deposit) && !this.min(p.deposit, 0)) {
      this.zErrorFactory.createErrorInfo(
        ['deposit'],
        {
          message: this.messages.minValue(p.deposit),
          actual: p.deposit,
        },
        errors,
      );
    }

    // risk
    if (!p.risk && !this.isDefined(p.risk)) {
      this.zErrorFactory.createErrorInfo(
        ['risk'],
        {
          message: this.messages.required(),
        },
        errors,
      );
    }

    if (p.risk && !this.isNumber(p.risk)) {
      this.zErrorFactory.createErrorInfo(
        ['risk'],
        {
          message: this.messages.number(),
        },
        errors,
      );
    }

    if (p.risk && this.isNumber(p.risk) && !this.min(p.risk, 0)) {
      this.zErrorFactory.createErrorInfo(
        ['risk'],
        {
          message: this.messages.minValue(p.risk),
          actual: p.risk,
        },
        errors,
      );
    }

    if (p.risk && this.isNumber(p.risk) && !this.max(p.risk, 1)) {
      this.zErrorFactory.createErrorInfo(
        ['risk'],
        {
          message: this.messages.maxValue(p.risk),
          actual: p.risk,
        },
        errors,
      );
    }

    // maxTradeVolumeQuoted
    // TODO: ???
    if (!p.maxTradeVolumeQuoted && !this.isDefined(p.maxTradeVolumeQuoted)) {
      this.zErrorFactory.createErrorInfo(
        ['maxTradeVolumeQuoted'],
        {
          message: this.messages.required(),
        },
        errors,
      );
    }

    if (p.maxTradeVolumeQuoted && !this.isNumber(p.maxTradeVolumeQuoted)) {
      this.zErrorFactory.createErrorInfo(
        ['maxTradeVolumeQuoted'],
        {
          message: this.messages.number(),
        },
        errors,
      );
    }

    if (p.maxTradeVolumeQuoted
      && this.isNumber(p.maxTradeVolumeQuoted)
      && !this.min(p.maxTradeVolumeQuoted, 0)
    ) {
      this.zErrorFactory.createErrorInfo(
        ['maxTradeVolumeQuoted'],
        {
          message: this.messages.minValue(p.risk),
          actual: p.maxTradeVolumeQuoted,
        },
        errors,
      );
    }

    // leverage
    if (!p.leverage || !p.leverage.allow) {
      this.zErrorFactory.createErrorInfo(
        ['leverage', 'allow'],
        {
          message: this.messages.required(),
        },
        errors,
      );
    }

    if (p.leverage && p.leverage.allow && !this.isBoolean(p.leverage.allow)) {
      this.zErrorFactory.createErrorInfo(
        ['leverage', 'allow'],
        {
          message: this.messages.boolean(),
        },
        errors,
      );
    }

    if (!p.leverage || !p.leverage.max) {
      this.zErrorFactory.createErrorInfo(
        ['leverage', 'max'],
        {
          message: this.messages.required(),
        },
        errors,
      );
    }

    if (p.leverage && p.leverage.max && !this.isNumber(p.leverage.max)) {
      this.zErrorFactory.createErrorInfo(
        ['leverage', 'max'],
        {
          message: this.messages.number(),
        },
        errors,
      );
    }

    if (p.leverage
      && p.leverage.max
      && this.isNumber(p.leverage.max)
      && !this.min(p.leverage.max, 1)
    ) {
      this.zErrorFactory.createErrorInfo(
        ['leverage', 'max'],
        {
          message: this.messages.minValue(p.leverage.max),
          actual: p.leverage.max,
        },
        errors,
      );
    }

    if (p.leverage
      && p.leverage.max
      && this.isNumber(p.leverage.max)
      && !this.max(p.leverage.max, 1000)
    ) {
      this.zErrorFactory.createErrorInfo(
        ['leverage', 'max'],
        {
          message: this.messages.maxValue(p.leverage.max),
          actual: p.leverage.max,
        },
        errors,
      );
    }

    // tradeType
    if (!p.tradeType) {
      this.zErrorFactory.createErrorInfo(
        ['tradeType'],
        {
          message: this.messages.required(),
        },
        errors,
      );
    }

    if (p.tradeType && !this.isString(p.tradeType)) {
      this.zErrorFactory.createErrorInfo(
        ['tradeType'],
        {
          message: this.messages.string(),
        },
        errors,
      );
    }

    // breakeven
    if (!p.breakeven || !p.breakeven.fee) {
      this.zErrorFactory.createErrorInfo(
        ['breakeven', 'fee'],
        {
          message: this.messages.required(),
        },
        errors,
      );
    }

    if (p.breakeven && p.breakeven.fee && !this.isNumber(p.breakeven.fee)) {
      this.zErrorFactory.createErrorInfo(
        ['breakeven', 'fee'],
        {
          message: this.messages.number(),
        },
        errors,
      );
    }

    return Object.entries(errors).length === 0 && errors.constructor === Object
      ? errors
      : undefined;
  }

  public validateEntries(p: TradeInfoArgs): ValidationTradeErrors | void {
    const errors: ValidationTradeErrors = {} as any;

    if (!p.entries) {
      this.zErrorFactory.createErrorInfo(
        ['entries', 0, 'entity'],
        {
          message: this.messages.required(),
        },
        errors,
      );

      return errors;
    }

    p.entries.forEach(
      (item: TradeOrderArg, i: number) => this.validateOrderBaseScenario('entries', item, i),
    );

    // checkSumVolumeParts
    if (!p.entries) {
      this.zErrorFactory.createErrorInfo(
        ['entries', 0, 'entity'],
        {
          message: this.messages.required(),
        },
        errors,
      );
    }

    // TODO: why equal '1'
    // Need to use eq
    const sumVolumeParts = p.entries.reduce((acc, val) => acc + val.volumePart);

    if (sumVolumeParts > 1) {
      this.zErrorFactory.createErrorInfo(
        ['entries', 0, 'entity'],
        {
          message: this.messages.sumVolumeParts(),
        },
        errors,
      );
    }

    return Object.entries(errors).length === 0 && errors.constructor === Object
      ? errors
      : undefined;
  }

  public validateStops(p: TradeInfoArgs): ValidationTradeErrors | void {
    const errors: ValidationTradeErrors = {} as any;

    if (!p.stops) {
      this.zErrorFactory.createErrorInfo(
        ['stops', 0, 'entity'],
        {
          message: this.messages.required(),
        },
        errors,
      );

      return errors;
    }

    p.stops.forEach(
      (item: TradeOrderArg, i: number) => this.validateOrderBaseScenario('stops', item, i),
    );

    // TODO: special validation
    if (p.tradeType === ETradeType.Long) {
      if (p.entries) {
        p.stops.forEach((item: TradeOrderArg, i: number) => {
          p.entries.forEach((itemEntry) => {
            if (item.price >= itemEntry.price) {
              this.zErrorFactory.createErrorInfo(
                ['stops', i, 'price'],
                {
                  message: this.messages.lessPrice(item.price, itemEntry.price),
                  actual: item.price,
                },
                errors,
              );
            }
          });
        });
      }
    }

    if (p.tradeType === ETradeType.Short) {
      if (p.entries) {
        p.stops.forEach((item: TradeOrderArg, i: number) => {
          p.entries.forEach((itemEntry) => {
            if (item.price < itemEntry.price) {
              this.zErrorFactory.createErrorInfo(
                ['stops', i, 'price'],
                {
                  message: this.messages.biggerPrice(item.price, itemEntry.price),
                  actual: item.price,
                },
                errors,
              );
            }
          });
        });
      }
    }

    return Object.entries(errors).length === 0 && errors.constructor === Object
      ? errors
      : undefined;
  }

  public validateTakes(p: TradeInfoArgs): ValidationTradeErrors | void {
    const errors: ValidationTradeErrors = {} as any;

    if (!p.takes) {
      this.zErrorFactory.createErrorInfo(
        ['stops', 0, 'entity'],
        {
          message: this.messages.required(),
        },
        errors,
      );

      return errors;
    }

    p.takes.forEach(
      (item: TradeOrderArg, i: number) => this.validateOrderBaseScenario('takes', item, i),
    );

    // TODO: special validation
    if (p.tradeType === ETradeType.Long) {
      if (p.entries) {
        p.takes.forEach((item: TradeOrderArg, i: number) => {
          p.entries.forEach((itemEntry) => {
            if (item.price < itemEntry.price) {
              this.zErrorFactory.createErrorInfo(
                ['takes', i, 'price'],
                {
                  message: this.messages.biggerPrice(item.price, itemEntry.price),
                  actual: item.price,
                },
                errors,
              );
            }
          });
        });
      }
    }

    if (p.tradeType === ETradeType.Short) {
      if (p.entries) {
        p.takes.forEach((item: TradeOrderArg, i: number) => {
          p.entries.forEach((itemEntry) => {
            if (item.price > itemEntry.price) {
              this.zErrorFactory.createErrorInfo(
                ['takes', i, 'price'],
                {
                  message: this.messages.lessPrice(item.price, itemEntry.price),
                  actual: item.price,
                },
                errors,
              );
            }
          });
        });
      }
    }

    return Object.entries(errors).length === 0 && errors.constructor === Object
      ? errors
      : undefined;
  }

  public validate(p: TradeInfoArgs): ValidationTradeErrors | void {
    let errors: ValidationTradeErrors;

    const commonFieldsErrors = this.validateCommonFields(p);
    const entriesErrors = this.validateEntries(p);
    const stopsErrors = this.validateStops(p);
    const takesErrors = this.validateTakes(p);

    errors = { ...commonFieldsErrors, ...entriesErrors, ...stopsErrors, ...takesErrors };

    return Object.entries(errors).length === 0 && errors.constructor === Object
      ? errors
      : undefined;
  }

  // TODO: need to set up type for entityName
  // need to create type = '' | '' | ''
  private validateOrderBaseScenario(entityName, item: TradeOrderArg, i: number): void {
    const errors: ValidationTradeErrors = {} as any;

    // price
    if (!item.price) {
      this.zErrorFactory.createErrorInfo(
        [entityName, i, 'price'],
        {
          message: this.messages.required(),
        },
        errors,
      );
    }

    if (item.price && !this.isNumber(item.price)) {
      this.zErrorFactory.createErrorInfo(
        [entityName, i, 'price'],
        {
          message: this.messages.number(),
        },
        errors,
      );
    }

    if (item.price
      && this.isNumber(item.price)
      && !this.min(item.price, 0)
    ) {
      this.zErrorFactory.createErrorInfo(
        [entityName, i, 'price'],
        {
          message: this.messages.minValue(item.price),
          actual: item.price,
        },
        errors,
      );
    }

    // TODO: max price ???

    // volumePart
    if (!item.volumePart) {
      this.zErrorFactory.createErrorInfo(
        [entityName, i, 'volumePart'],
        {
          message: this.messages.required(),
        },
        errors,
      );
    }

    if (item.volumePart && !this.isNumber(item.volumePart)) {
      this.zErrorFactory.createErrorInfo(
        [entityName, i, 'volumePart'],
        {
          message: this.messages.number(),
        },
        errors,
      );
    }

    if (item.volumePart
      && this.isNumber(item.volumePart)
      && !this.min(item.volumePart, 0)
    ) {
      this.zErrorFactory.createErrorInfo(
        [entityName, i, 'volumePart'],
        {
          message: this.messages.minValue(item.volumePart),
          actual: item.volumePart,
        },
        errors,
      );
    }

    if (item.volumePart
      && this.isNumber(item.volumePart)
      && !this.max(item.volumePart, 1)
    ) {
      this.zErrorFactory.createErrorInfo(
        [entityName, i, 'volumePart'],
        {
          message: this.messages.maxValue(item.volumePart),
          actual: item.volumePart,
        },
        errors,
      );
    }

    // fee
    if (!item.fee) {
      this.zErrorFactory.createErrorInfo(
        [entityName, i, 'fee'],
        {
          message: this.messages.required(),
        },
        errors,
      );
    }

    if (item.fee && !this.isNumber(item.fee)) {
      this.zErrorFactory.createErrorInfo(
        [entityName, i, 'fee'],
        {
          message: this.messages.number(),
        },
        errors,
      );
    }

    if (item.fee
      && this.isNumber(item.fee)
      && !this.min(item.fee, 0)
    ) {
      this.zErrorFactory.createErrorInfo(
        [entityName, i, 'fee'],
        {
          message: this.messages.minValue(item.fee),
          actual: item.fee,
        },
        errors,
      );
    }

    if (item.fee
      && this.isNumber(item.fee)
      && !this.max(item.fee, 1)
    ) {
      this.zErrorFactory.createErrorInfo(
        [entityName, i, 'fee'],
        {
          message: this.messages.maxValue(item.fee),
          actual: item.fee,
        },
        errors,
      );
    }
  }
}

export const zValidations = new ZValidations();
