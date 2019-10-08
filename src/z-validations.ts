import {
  TradeInfoArgs,
  ETradeType,
  TradeOrderArg
} from './models';

export interface ErrorInfo<T> {
  message: string;
  actual?: T;
}

export type OrderError = {[key in keyof TradeOrderArg]?: ErrorInfo};

export interface TradeOrderErrors {
  [orderIndex: number]: OrderError;
}

export interface IsNumberOptions {
  allowNaN?: boolean;
  allowInfinity?: boolean;
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
  public createErrorInfo(
    model: ValidationTradeErrors = {},
    path: string,
    value: ErrorInfo | TradeOrderErrors,
  ): ValidationTradeErrors {
    let model = model;
    const pathParts = path.split('.');
    let currentObject = model;

    for (let i in pathParts) {
      const key = pathParts[i];
      const length = pathParts.length - 1;

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

  private errors: ValidationTradeErrors = {};

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

  public getMaxStopLossPrice(p: TradeInfoArgs): number {
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

  public validateCommonFields(p: TradeInfoArgs): ValidationTradeErrors | null {
    // deposit
    if (!p.deposit && !this.isDefined(p.deposit)) {
      this.zErrorFactory.createErrorInfo(this.errors, 'deposit', {
        message: this.messages.required,
      });
    }

    if (p.deposit && !this.isNumber(p.deposit)) {
      this.zErrorFactory.createErrorInfo(this.errors, 'deposit', {
        message: this.messages.number,
      });
    }

    if (p.deposit && this.isNumber(p.deposit) && !this.min(p.deposit, 0)) {
      this.zErrorFactory.createErrorInfo(this.errors, 'deposit', {
        message: this.messages.minValue(p.deposit),
        actual: p.deposit,
      });
    }

    // risk
    if (!p.risk && !this.isDefined(p.risk)) {
      this.zErrorFactory.createErrorInfo(this.errors, 'risk', {
        message: this.messages.required,
      });
    }

    if (p.risk && !this.isNumber(p.risk)) {
      this.zErrorFactory.createErrorInfo(this.errors, 'risk', {
        message: this.messages.number,
      });
    }

    if (p.risk && this.isNumber(p.risk) && !this.min(p.risk, 0)) {
      this.zErrorFactory.createErrorInfo(this.errors, 'risk', {
        message: this.messages.minValue(p.risk),
        actual: p.risk,
      });
    }

    if (p.risk && this.isNumber(p.risk) && !this.max(p.risk, 1)) {
      this.zErrorFactory.createErrorInfo(this.errors, 'risk', {
        message: this.messages.maxValue(p.risk),
        actual: p.risk,
      });
    }

    // maxTradeVolumeQuoted
    if (!p.maxTradeVolumeQuoted && !this.isDefined(p.maxTradeVolumeQuoted)) {
      this.zErrorFactory.createErrorInfo(this.errors, 'maxTradeVolumeQuoted', {
        message: this.messages.required,
      });
    }

    if (p.maxTradeVolumeQuoted && !this.isNumber(p.maxTradeVolumeQuoted)) {
      this.zErrorFactory.createErrorInfo(this.errors, 'maxTradeVolumeQuoted', {
        message: this.messages.number,
      });
    }

    if (p.maxTradeVolumeQuoted
      && this.isNumber(p.maxTradeVolumeQuoted)
      && !this.min(p.maxTradeVolumeQuoted, 0)
    ) {
      this.zErrorFactory.createErrorInfo(this.errors, 'maxTradeVolumeQuoted', {
        message: this.messages.minValue(p.risk),
        actual: p.maxTradeVolumeQuoted,
      });
    }

    // leverage
    if (!p.leverage || !p.leverage.allow) {
      this.zErrorFactory.createErrorInfo(this.errors, 'leverage.allow', {
        message: this.messages.required,
      });
    }

    if (p.leverage && p.leverage.allow && !this.isBoolean(p.leverage.allow)) {
      this.zErrorFactory.createErrorInfo(this.errors, 'leverage.allow', {
        message: this.messages.boolean,
      });
    }

    if (!p.leverage || !p.leverage.max) {
      this.zErrorFactory.createErrorInfo(this.errors, 'leverage.max', {
        message: this.messages.required,
      });
    }

    if (p.leverage && p.leverage.max && !this.isNumber(p.leverage.max)) {
      this.zErrorFactory.createErrorInfo(this.errors, 'leverage.max', {
        message: this.messages.number,
      });
    }

    if (p.leverage
      && p.leverage.max
      && this.isNumber(p.leverage.max)
      && !this.min(p.leverage.max, 0)
    ) {
      this.zErrorFactory.createErrorInfo(this.errors, 'leverage.max', {
        message: this.messages.minValue(leverage.max),
        actual: p.leverage.max,
      });
    }

    if (p.leverage
      && p.leverage.max
      && this.isNumber(p.leverage.max)
      && !this.max(p.leverage.max, 1000)
    ) {
      this.zErrorFactory.createErrorInfo(this.errors, 'leverage.max', {
        message: this.messages.maxValue(leverage.max),
        actual: p.leverage.max,
      });
    }

    // tradeType
    if (!p.tradeType) {
      this.zErrorFactory.createErrorInfo(this.errors, 'tradeType', {
        message: this.messages.required,
      });
    }

    if (p.tradeType && !this.isString(p.tradeType)) {
      this.zErrorFactory.createErrorInfo(this.errors, 'tradeType', {
        message: this.messages.string,
      });
    }

    // breakeven
    if (!p.breakeven || !p.breakeven.fee) {
      this.zErrorFactory.createErrorInfo(this.errors, 'breakeven.fee', {
        message: this.messages.required,
      });
    }

    if (p.breakeven && p.breakeven.fee && !this.isNumber(p.breakeven.fee)) {
      this.zErrorFactory.createErrorInfo(this.errors, 'breakeven.fee', {
        message: this.messages.number,
      });
    }

    return Object.entries(this.errors).length === 0 && this.errors.constructor === Object
      ? this.errors
      : null;
  }

  public validate(p: TradeInfoArgs) {
    const isValidCommonFields = this.validateCommonFields(p);
    const isValidEntries;
    const isValidStops;
    const isValidTakes;
  }

  private buildError(key: string, msg: string, path?: string): void {
    this.errors[key] = {
      message: msg,
    };
  }

  private setError() {
    //
  }

  private cleanErrors(): void {
    this.errors = {};
  }
}

export const ZValidations = new ZValidations();
