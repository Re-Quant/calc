// eslint-disable-next-line max-classes-per-file
import {
  TradeInfoArgs,
  ETradeType,
  TradeOrderArg,
} from './models';

export interface ErrorInfo {
  message: string;
  actual?: number | string;
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

/* eslint-disable max-len */
export type EntityName = 'entries' | 'stops' | 'takes' | 'breakeven' | 'deposit' | 'risk' | 'leverage' | 'maxTradeVolumeQuoted' | 'tradeType';

class ZValidationErrorFactory {
  /* eslint-disable max-len */
  public createErrorInfo<O extends ValidationTradeErrors, K1 extends keyof O>(keys: [K1], value: ErrorInfo, model: O): O[K1];
  public createErrorInfo<O extends ValidationTradeErrors, K1 extends keyof O, K2 extends keyof Required<O>[K1]>(keys: [K1, K2], value: ErrorInfo, model: O): O[K1][K2];
  public createErrorInfo<O extends ValidationTradeErrors, K1 extends keyof O, K2 extends keyof Required<O>[K1], K3 extends keyof Required<O>[K1][K2]>(keys: [K1, K2, K3], value: ErrorInfo, model: O): O[K1][K2][K3];
  public createErrorInfo<O extends ValidationTradeErrors>(
    keys: string[],
    value: ErrorInfo,
    model: O,
  ): ValidationTradeErrors {
    let currentObject: any = model;

    // tslint:disable-next-line:forin
    // eslint-disable-next-line @typescript-eslint/no-for-in-array,guard-for-in,no-restricted-syntax
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
export class ZValidations {
  public messages = {
    required: (): string => 'Required field',
    number: (): string => 'Should be a number',
    string: (): string => 'Should be a string',
    boolean: (): string => 'Should be a boolean',
    sumVolumeParts: (): string => 'Sum of volume parts should be no more than \'1\'',
    minValue: (actual: number): string => `Value should be more then ${ actual }.`,
    maxValue: (actual: number): string => `Value should be less then ${ actual }.`,
    lessPrice: (actual: number, comperingPrice: number): string => `Price ${ actual } should be less then ${ comperingPrice }.`,
    biggerPrice: (actual: number, comperingPrice: number): string => `Price ${ actual } should be more then ${ comperingPrice }.`,
    wrongTradeType: () => 'Wrong trade type',
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

  public validateCommonFields(p: TradeInfoArgs): ValidationTradeErrors | undefined {
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

    if (p.risk && this.isNumber(p.risk) && !this.max(p.risk, 0.1)) {
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
          message: this.messages.minValue(p.maxTradeVolumeQuoted),
          actual: p.maxTradeVolumeQuoted,
        },
        errors,
      );
    }

    // leverage
    // eslint-disable-next-line no-prototype-builtins
    if (!p.leverage || !(p.leverage.hasOwnProperty('allow'))) {
      this.zErrorFactory.createErrorInfo(
        ['leverage', 'allow'],
        {
          message: this.messages.required(),
        },
        errors,
      );
    }

    // eslint-disable-next-line no-prototype-builtins
    if (p.leverage && !(p.leverage.hasOwnProperty('allow')) && !this.isBoolean(p.leverage.allow)) {
      this.zErrorFactory.createErrorInfo(
        ['leverage', 'allow'],
        {
          message: this.messages.boolean(),
        },
        errors,
      );
    }

    // eslint-disable-next-line no-prototype-builtins
    if (!p.leverage || !(p.leverage.hasOwnProperty('max'))) {
      this.zErrorFactory.createErrorInfo(
        ['leverage', 'max'],
        {
          message: this.messages.required(),
        },
        errors,
      );
    }

    // eslint-disable-next-line no-prototype-builtins
    if (p.leverage && p.leverage.hasOwnProperty('max') && !this.isNumber(p.leverage.max)) {
      this.zErrorFactory.createErrorInfo(
        ['leverage', 'max'],
        {
          message: this.messages.number(),
        },
        errors,
      );
    }

    if (p.leverage
      && p.leverage.hasOwnProperty('allow') // eslint-disable-line no-prototype-builtins
      && p.leverage.hasOwnProperty('max')   // eslint-disable-line no-prototype-builtins
      && this.isNumber(p.leverage.max)
      && !this.min(p.leverage.max, 0)
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
      && p.leverage.hasOwnProperty('allow') // eslint-disable-line no-prototype-builtins
      && p.leverage.hasOwnProperty('max')   // eslint-disable-line no-prototype-builtins
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

    if (p.tradeType && !(Object.values(ETradeType).includes(p.tradeType))) {
      this.zErrorFactory.createErrorInfo(
        ['tradeType'],
        {
          message: this.messages.wrongTradeType(),
          actual: p.tradeType,
        },
        errors,
      );
    }

    // breakeven fee
    // eslint-disable-next-line no-prototype-builtins
    if (!p.breakeven || !p.breakeven.hasOwnProperty('fee')) {
      this.zErrorFactory.createErrorInfo(
        ['breakeven', 'fee'],
        {
          message: this.messages.required(),
        },
        errors,
      );
    }

    if (p.breakeven
      && p.breakeven.hasOwnProperty('fee') // eslint-disable-line no-prototype-builtins
      && !this.isNumber(p.breakeven.fee)
    ) {
      this.zErrorFactory.createErrorInfo(
        ['breakeven', 'fee'],
        {
          message: this.messages.number(),
        },
        errors,
      );
    }

    if (p.breakeven
      && p.breakeven.hasOwnProperty('fee') // eslint-disable-line no-prototype-builtins
      && this.isNumber(p.breakeven.fee)
      && !this.min(p.breakeven.fee, 0)
    ) {
      this.zErrorFactory.createErrorInfo(
        ['breakeven', 'fee'],
        {
          message: this.messages.minValue(p.breakeven.fee),
          actual: p.breakeven.fee,
        },
        errors,
      );
    }

    if (p.breakeven
      && p.breakeven.hasOwnProperty('fee') // eslint-disable-line no-prototype-builtins
      && this.isNumber(p.breakeven.fee)
      && !this.max(p.breakeven.fee, 0.1)
    ) {
      this.zErrorFactory.createErrorInfo(
        ['breakeven', 'fee'],
        {
          message: this.messages.maxValue(p.breakeven.fee),
          actual: p.breakeven.fee,
        },
        errors,
      );
    }

    return Object.entries(errors).length === 0 && errors.constructor === Object
      ? undefined
      : errors;
  }

  public validateEntries(p: TradeInfoArgs): ValidationTradeErrors | undefined {
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
      (item: TradeOrderArg, i: number) => this.validateOrderBaseScenario('entries', item, i, errors),
    );

    // checkSumVolumeParts
    this.validateSumVolumeParts('entries', p.entries, errors);

    return Object.entries(errors).length === 0 && errors.constructor === Object
      ? undefined
      : errors;
  }

  public validateStops(p: TradeInfoArgs): ValidationTradeErrors | undefined {
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
      (item: TradeOrderArg, i: number) => this.validateOrderBaseScenario('stops', item, i, errors),
    );

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

    // checkSumVolumeParts
    this.validateSumVolumeParts('stops', p.stops, errors);

    return Object.entries(errors).length === 0 && errors.constructor === Object
      ? undefined
      : errors;
  }

  public validateTakes(p: TradeInfoArgs): ValidationTradeErrors | undefined {
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
      (item: TradeOrderArg, i: number) => this.validateOrderBaseScenario('takes', item, i, errors),
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

    // checkSumVolumeParts
    this.validateSumVolumeParts('takes', p.takes, errors);

    return Object.entries(errors).length === 0 && errors.constructor === Object
      ? undefined
      : errors;
  }

  public validate(p: TradeInfoArgs): ValidationTradeErrors | undefined {
    const commonFieldsErrors = this.validateCommonFields(p);
    const entriesErrors = this.validateEntries(p);
    const stopsErrors = this.validateStops(p);
    const takesErrors = this.validateTakes(p);

    const errors: ValidationTradeErrors = {
      ...commonFieldsErrors, ...entriesErrors, ...stopsErrors, ...takesErrors,
    };

    return Object.entries(errors).length === 0 && errors.constructor === Object
      ? undefined
      : errors;
  }

  // TODO: need to set up type for entityName
  private validateOrderBaseScenario(
    entityName: any,
    item: TradeOrderArg,
    i: number,
    errors: ValidationTradeErrors,
  ): void {
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
      && !this.max(item.fee, 0.1)
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

  private validateSumVolumeParts(entityName: any, entity: TradeOrderArg[], errors: ValidationTradeErrors): void {
    const sumVolumeParts = entity.reduce((acc: number, val) => acc + val.volumePart, 0);

    if (sumVolumeParts > 1) {
      this.zErrorFactory.createErrorInfo(
        [entityName, 0, 'entity'],
        {
          message: this.messages.sumVolumeParts(),
          actual: sumVolumeParts,
        },
        errors,
      );
    }
  }
}

export const zValidations = new ZValidations();
