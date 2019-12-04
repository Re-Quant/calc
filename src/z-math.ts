export class ZMath {

  /**
   * Sigma Summary
   */
  public sigmaSum<T>(payload: T[], cb: (i: number, value: T) => number): number;
  /**
   * Sigma Summary
   */
  public sigmaSum<T>(to: number, cb: (i: number) => number): number;
  /**
   * Sigma Summary
   */
  public sigmaSum<T>(from: number, to: number, cb: (i: number) => number): number;
  /**
   * Sigma Summary
   */
  public sigmaSum(...args: any[]): number {
    let payload: any[] | undefined;
    let from = 0;
    let to: number;
    let cb: (i: number, value?: any) => number;

    if (typeof args[0] === 'number') {
      if (typeof args[1] === 'number' && typeof args[2] === 'function') {
        [from, to, cb] = args;
      } else if (typeof args[1] === 'function') {
        from = 0;
        [to, cb] = args;
      } else {
        throw new TypeError('ZMath.sum() Wrong arguments');
      }
    } else if (args[0] instanceof Array && typeof args[1] === 'function') {
      [payload, cb] = args;
      from = 0;
      to = payload!.length - 1;
    } else {
      throw new TypeError('ZMath.sum() Wrong arguments');
    }

    let sum = 0;
    if (payload) {
      for (let i = from; i <= to; i++) sum += cb(i, payload[i]);
    } else {
      for (let i = from; i <= to; i++) sum += cb(i);
    }

    return sum;
  }

  public round(value: number, precision: number): number {
    const multiplier = 10 ** precision;
    return Math.round(value * multiplier) / multiplier;
  }

  public ceil(value: number, precision: number): number {
    const multiplier = 10 ** precision;
    return Math.ceil(value * multiplier) / multiplier;
  }

  public floor(value: number, precision: number): number {
    const multiplier = 10 ** precision;
    return Math.floor(value * multiplier) / multiplier;
  }

  /** Comparing float numbers */
  public eq(n1: number, n2: number): boolean {
    return Math.abs(n1 - n2) < Number.EPSILON;
  }

  public sum(arr: number[]): number {
    let sum = 0;
    for (let i = 0, ilen = arr.length; i < ilen; i++) sum += arr[i];

    return sum;
  }

  /**
   * @param arr    array of objects
   * @param picker callback or field name
   */
  public sumBy<T>(arr: T[], picker: keyof T | ((v: T, i: number) => number)): number {
    let sum = 0;

    if (typeof picker === 'function') {
      for (let i = 0, ilen = arr.length; i < ilen; i++) sum += picker(arr[i], i);
    } else {
      for (let i = 0, ilen = arr.length; i < ilen; i++) sum += +arr[i][picker];
    }

    return sum;
  }

}

export const zMath = new ZMath();
