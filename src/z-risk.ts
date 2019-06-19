import { zMath as zMathInstance, ZMath } from './z-math';

interface TradeSumOrder {
  /** Price for the order execution */
  p: number;
  /** Part of whole money sum for this trade (percent 0..1) */
  i: number;
  /** Fee for the order (percent 0..1) */
  f: number;
}

export interface TradeSumArgs {
  /** Whole Deposit */
  d: number;
  /** Maximum risk for the trade (percent 0..1) */
  r: number;

  /** Entry Orders - Orders for get a position */
  entries: TradeSumOrder[];
  /** Stop-Loss Orders - Get rid of the position */
  stops: TradeSumOrder[];
}

export class ZRisk {

  public constructor(
    private zMath: ZMath,
  ) {}

  /**
   * @return trade sum in quoted units
   * @todo: test
   */
  public tradeSumQ({ d, r, entries, stops }: TradeSumArgs): number {
    const vRisk = d * r;

    const x = this.zMath.sigmaSum(entries, v => v.i * v.f);
    const y = this.zMath.sigmaSum(entries, v => v.i / v.p)
      * (
          this.zMath.sigmaSum(stops, v => v.i * v.p)
        + this.zMath.sigmaSum(stops, v => v.i * v.f)
      );

    return vRisk / (1 - x - y); // vSumQOriginal
  }

  /**
   * Distribute whole sum(sum of many or something else) for multiple parts
   * @todo: test & description
   *
   * @param sum
   * @param percentages
   */
  public distribute(sum: number, percentages: number[]): number[] {
    const percentagesSum = this.zMath.sum(percentages);
    if (!this.zMath.eq(percentagesSum, 1)) {
      throw new RangeError(`ZRisk.sum() The sum of percentages always should be equal 1`);
    }

    return percentages.map(v => sum * v);
  }

}

export const zRisk = new ZRisk(zMathInstance);
