export class ZMath {

  /**
   * Sigma Summary
   */
  public sigmaSum<T>(payload: T[], cb: (value: T, i: number) => number): number;
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
        from = args[0];
        to   = args[1];
        cb   = args[2];
      } else if (typeof args[1] === 'function') {
        from = 0;
        to = args[0];
        cb   = args[1];
      } else {
        throw new TypeError('ZMath.sum() Wrong arguments');
      }
    } else if (args[0] instanceof Array && typeof args[1] === 'function') {
      payload = args[0] as any[];
      from = 0;
      to = payload.length - 1;
      cb = args[1];
    } else {
      throw new TypeError('ZMath.sum() Wrong arguments');
    }

    let sum = 0;
    if (payload) {
      for (let i = from; i <= to; i++) {
        sum += cb(payload[i], i);
      }
    } else {
      for (let i = from; i <= to; i++) {
        sum += cb(i);
      }
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

  public eq(n1: number, n2: number): boolean {
    return Math.abs(n1 - n2) < Number.EPSILON;
  }

  public sum(arr: number[]): number {
    return arr.reduce((a, b) => a + b);
  }

}

export const zMath = new ZMath();
