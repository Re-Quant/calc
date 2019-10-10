import {
  TradeInfoArgs,
  ETradeType,
  TradeOrderArg
} from './models';

export interface ErrorInfo {
  message: string;
  actual?: number;
}

export type OrderError = {[key in keyof TradeOrderArg]?: ErrorInfo};

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
  public createErrorInfo<O extends ValidationTradeErrors, K1 extends keyof O>(
    keys: [K1],
    value: ErrorInfo,
    model: O,
  ): O[K1];
  public createErrorInfo<O extends ValidationTradeErrors, K1 extends keyof O, K2 extends keyof Required<O>[K1]>(
    keys: [K1, K2],
    value: ErrorInfo,
    model: O,
  ): O[K1][K2];
  public createErrorInfo<O extends ValidationTradeErrors>(
    keys: string[],
    value: ErrorInfo,
    model: O,
  ): ValidationTradeErrors {
    let currentObject: any = model;

    for (let i in keys) {
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
  };
}

class ZValidations {
  public messages = {
    required: 'required field',
    number: 'should be a number',
    string: 'should be a string',
    boolean: 'should be a boolean',
    minValue: (actual: number): string => `Value should more then ${ actual }.`,
    maxValue: (actual: number): string => `Value should less then ${ actual }.`,
  }
  public zErrorFactory: ZValidationErrorFactory;

  private errors: ValidationTradeErrors = {} as any;

  constructor() {
    this.zErrorFactory = new ZValidationErrorFactory();
  }

  public isDefined(value: unknown): boolean {
    return value !== undefined && value !== null;
  }

  public isNumber(value: unknown, options: IsNumberOptions = {
    allowNaN: false,
    allowInfinity: false
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

  public getMaxStopLossPrice(p: TradeInfoArgs) {
  //   return _.maxBy(p.stops, (o: TradeOrderArg) => o.price);
  }

  public checkEntriesOrder(p: TradeInfoArgs) {
    const isLongType = p.tradeType === ETradeType.Long;

    if (p.tradeType === ETradeType.Long) {
      //   const maxStopLossPrice: number = _.maxBy(p.stops, (o: TradeOrderArg) => o.price);
    }
    //
    if (p.tradeType === ETradeType.Short) {
      //
    }
  }

  public validateCommonFields(p: TradeInfoArgs): ValidationTradeErrors | void {
    // deposit
    if (!p.deposit && !this.isDefined(p.deposit)) {
      this.zErrorFactory.createErrorInfo(
        ['deposit'],
        {
          message: this.messages.required,
        },
        this.errors
      );
    }

    if (p.deposit && !this.isNumber(p.deposit)) {
      this.zErrorFactory.createErrorInfo(
        ['deposit'],
        {
          message: this.messages.number,
        },
        this.errors
      );
    }

    if (p.deposit && this.isNumber(p.deposit) && !this.min(p.deposit, 0)) {
      this.zErrorFactory.createErrorInfo(
        ['deposit'],
        {
          message: this.messages.minValue(p.deposit),
          actual: p.deposit,
        },
        this.errors
      );
    }

    // risk
    if (!p.risk && !this.isDefined(p.risk)) {
      this.zErrorFactory.createErrorInfo(
        ['risk'],
        {
          message: this.messages.required,
        },
        this.errors
      );
    }

    if (p.risk && !this.isNumber(p.risk)) {
      this.zErrorFactory.createErrorInfo(
        ['risk'],
        {
          message: this.messages.number,
        },
        this.errors
      );
    }

    if (p.risk && this.isNumber(p.risk) && !this.min(p.risk, 0)) {
      this.zErrorFactory.createErrorInfo(
        ['risk'],
        {
          message: this.messages.minValue(p.risk),
          actual: p.risk,
        },
        this.errors
      );
    }

    if (p.risk && this.isNumber(p.risk) && !this.max(p.risk, 1)) {
      this.zErrorFactory.createErrorInfo(
        ['risk'],
        {
          message: this.messages.maxValue(p.risk),
          actual: p.risk,
        },
        this.errors
      );
    }

    // maxTradeVolumeQuoted
    if (!p.maxTradeVolumeQuoted && !this.isDefined(p.maxTradeVolumeQuoted)) {
      this.zErrorFactory.createErrorInfo(
        ['maxTradeVolumeQuoted'],
        {
          message: this.messages.required,
        },
        this.errors
      );
    }

    if (p.maxTradeVolumeQuoted && !this.isNumber(p.maxTradeVolumeQuoted)) {
      this.zErrorFactory.createErrorInfo(
        ['maxTradeVolumeQuoted'],
        {
          message: this.messages.number,
        },
        this.errors
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
        this.errors
      );
    }

    // leverage
    if (!p.leverage || !p.leverage.allow) {
      this.zErrorFactory.createErrorInfo(
        ['leverage', 'allow'],
        {
          message: this.messages.required,
        },
        this.errors
      );
    }

    if (p.leverage && p.leverage.allow && !this.isBoolean(p.leverage.allow)) {
      this.zErrorFactory.createErrorInfo(
        ['leverage', 'allow'],
        {
          message: this.messages.boolean,
        },
        this.errors
      );
    }

    if (!p.leverage || !p.leverage.max) {
      this.zErrorFactory.createErrorInfo(
        ['leverage', 'max'],
        {
          message: this.messages.required,
        },
        this.errors
      );
    }

    if (p.leverage && p.leverage.max && !this.isNumber(p.leverage.max)) {
      this.zErrorFactory.createErrorInfo(
        ['leverage', 'max'],
        {
          message: this.messages.number,
        },
        this.errors
      );
    }

    if (p.leverage
      && p.leverage.max
      && this.isNumber(p.leverage.max)
      && !this.min(p.leverage.max, 0)
    ) {
      this.zErrorFactory.createErrorInfo(
        ['leverage', 'max'],
        {
          message: this.messages.minValue(p.leverage.max),
          actual: p.leverage.max,
        },
        this.errors
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
        this.errors
      );
    }

    // tradeType
    if (!p.tradeType) {
      this.zErrorFactory.createErrorInfo(
        ['tradeType'],
        {
          message: this.messages.required,
        },
        this.errors
      );
    }

    if (p.tradeType && !this.isString(p.tradeType)) {
      this.zErrorFactory.createErrorInfo(
        ['tradeType'],
        {
          message: this.messages.string,
        },
        this.errors
      );
    }

    // breakeven
    if (!p.breakeven || !p.breakeven.fee) {
      this.zErrorFactory.createErrorInfo(
        ['breakeven', 'fee'],
        {
          message: this.messages.required,
        },
        this.errors
      );
    }

    if (p.breakeven && p.breakeven.fee && !this.isNumber(p.breakeven.fee)) {
      this.zErrorFactory.createErrorInfo(
        ['breakeven', 'fee'],
        {
          message: this.messages.number,
        },
        this.errors
      );
    }

    return Object.entries(this.errors).length === 0 && this.errors.constructor === Object
      ? this.errors
      : undefined;
  }

  public validateEntries(p: TradeInfoArgs): ValidationTradeErrors | void {}
  public validateStops(p: TradeInfoArgs): ValidationTradeErrors | void {}
  public validateTakes(p: TradeInfoArgs): ValidationTradeErrors | void {}

  public validate(p: TradeInfoArgs) {
    const isValidCommonFields = this.validateCommonFields(p);
    const isValidEntries = this.validateEntries(p);
    const isValidStops = this.validateStops(p);
    const isValidTakes = this.validateTakes(p);
  }

  private cleanErrors(): void {
    this.errors = {} as any;
  }
}

export const zValidations = new ZValidations();
