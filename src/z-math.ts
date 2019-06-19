export class ZMath {

  /**
   * Sigma Summary
   */
  public sum<T>(payload: T[], cb: (i: number, value: T) => number): number;
  /**
   * Sigma Summary
   */
  public sum<T>(to: number, cb: (i: number) => number): number;
  /**
   * Sigma Summary
   */
  public sum<T>(from: number, to: number, cb: (i: number) => number): number;
  /**
   * Sigma Summary
   */
  public sum(...args: any[]): number {
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
        sum += cb(i, payload[i]);
      }
    } else {
      for (let i = from; i <= to; i++) {
        sum += cb(i);
      }
    }
    return sum;
  }

}

export const zMath = new ZMath();
