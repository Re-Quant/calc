import { zMath, ZMath } from './z-math';

interface TradeOrderArg {
  /** Price for the order execution */
  p: number;
  /** Part of whole money sum for this trade (percent 0..1) */
  i: number;
  /** Fee for the order (percent 0..1) */
  f: number;
}

interface TradeOrder extends TradeOrderArg {
  /** Volume for the order in Quoted units */
  vq: number;
  /** Volume for the order in Base units */
  vb: number;
  /** Fee Volume for the order in Quoted units */
  fvq: number;
  /** Fee Volume for the order in Base units */
  fvb: number;
}

// function validateOrderPartPercentages(entries: TradeSumOrder[], stops: TradeSumOrder[]) {
//   if (!zMath.eq(zMath.sumBy(entries, 'i'), 1)
//     || !zMath.eq(zMath.sumBy(stops, 'i'), 1)
//   ) {
//     /* tslint:disable-next-line:max-line-length */
//     throw new Error(
//     'Percentage sum of all parts for order in "entries" and "stops" arrays should be equal "1"');
//   }
// }

export interface TradeInfoArgs<T = TradeOrderArg> {
  /** Whole Deposit */
  d: number;
  /** Maximum risk for the trade (percent 0..1) */
  r: number;

  /** Entry Orders - Orders for get a position */
  entries: T[];
  /** Stop-Loss Orders - Get rid of the position */
  stops: T[];
}

interface TradeInfo extends TradeInfoArgs<TradeOrder> {
  totalVolume: {
    entries: {
      orders: { quoted: number; base: number };
      fees: { quoted: number; base: number };
    };
    stops: {
      orders: { quoted: number; base: number };
      fees: { quoted: number; base: number };
    };
  };
}

export class ZRisk {

  public constructor(
    private math: ZMath,
  ) {}

  /**
   * @return summary volume of the trade in quoted units
   * @todo: test
   */
  public tradeVolumeQuoted({ d, r, entries, stops }: TradeInfoArgs): number {
    const vRisk = d * r;

    const x = this.math.sumBy(entries, v => v.i * v.f);
    const y = this.math.sumBy(entries, v => v.i / v.p)
      * (
          this.math.sumBy(stops, v => v.i * v.p)
        + this.math.sumBy(stops, v => v.i * v.f)
      );

    return vRisk / (1 - x - y); // vSumQEntries
  }

  /**
   * Distribute whole sum(sum of many or something else) for multiple parts
   *
   * @param sum
   * @param percentages 0..1
   */
  public distribute(sum: number, percentages: number[]): number[] {
    return percentages.map(percent => sum * percent);
  }

  public getTradeInfo(args: TradeInfoArgs): TradeInfo {
    const Pe = args.entries.map(o => o.p);
    const Ie = args.entries.map(o => o.i);
    const Fe = args.entries.map(o => o.f);

    const Ps = args.stops.map(o => o.p);
    const Is = args.stops.map(o => o.i);
    const Fs = args.stops.map(o => o.f);

    const vSumEntriesQ = this.tradeVolumeQuoted(args);
    const VeQ = Ie.map(v => vSumEntriesQ * v);
    const VeB = VeQ.map((v, i) => v / Pe[i]);
    const vSumEntriesB = this.math.sum(VeB);

    const VsB = Is.map(v => vSumEntriesB * v);
    const VsQ = VsB.map((v, i) => v * Ps[i]);
    const vSumStopsB = this.math.sum(VsB);
    const vSumStopsQ = this.math.sum(VsQ);

    const FeVQ = VeQ.map((v, i) => v * Fe[i]);
    const FeVB = VeB.map((v, i) => v * Fe[i]);
    const FsVQ = VsQ.map((v, i) => v * Fs[i]);
    const FsVB = VsB.map((v, i) => v * Fs[i]);

    const vSumFeeEntryQ = this.math.sum(FeVQ);
    const vSumFeeEntryB = this.math.sum(FeVB);
    const vSumFeeStopQ  = this.math.sum(FsVQ);
    const vSumFeeStopB  = this.math.sum(FsVB);

    return {
      ...args,
      entries: args.entries.map((order, i) => ({ ...order, vq: VeQ[i], vb: VeB[i], fvq: FeVQ[i], fvb: FeVB[i] })), /* tslint:disable-line:max-line-length */
      stops:   args.stops  .map((order, i) => ({ ...order, vq: VsQ[i], vb: VsB[i], fvq: FsVQ[i], fvb: FsVB[i] })), /* tslint:disable-line:max-line-length */
      totalVolume: {
        entries: {
          orders: { quoted: vSumEntriesQ, base: vSumEntriesB, },
          fees: { quoted: vSumFeeEntryQ, base: vSumFeeEntryB },
        },
        stops: {
          orders: { quoted: vSumStopsQ, base: vSumStopsB, },
          fees: { quoted: vSumFeeStopQ, base: vSumFeeStopB },
        },
      },
    };
  }

  public unzip<T extends object>(objects: T[]): { [key in keyof T]?: number[] } {
    const res: { [key in keyof T]?: number[] } = {};
    if (!objects.length) { return res; }

    const keys = Object.keys(objects[0]);
    for (let i = 0; i < objects.length; i++) {
      for (let j = 0; j < keys.length; j++) {
        const key: keyof T = keys[j] as any;
        if (!res[key]) {
          res[key] = [];
        }
        // @ts-ignore
        res[key][i] = objects[i][key];
      }
    }

    return res;
  }

  // @todo: try to rewrite with .forEach
  public zip<T extends {[key: string]: number[]}>(map: { [key in keyof T]: number[] }): T[] {
    const res: T[] = [];

    const keys = Object.keys(map);
    if (!keys.length) { return res; }

    const len = (map[keys[0] as keyof T]).length;
    if (!len) { return res; }

    for (let i = 0; i < len; i++) {
      const item: T = {} as any;
      for (let j = 0; j < keys.length; j++) {
        const key: keyof T = keys[j] as any;
        // @ts-ignore
        item[key] = map[key][i];
      }
      res.push(item);
    }

    return res;
  }

}

export const zRisk = new ZRisk(zMath);
