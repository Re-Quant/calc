import { zMath, ZMath } from './z-math';

interface TradeOrderArg {
  /** Price for the order execution */
  price: number;
  /** Part of total volume for this trade (percent 0..1) */
  volumePart: number;
  /**
   * Fee for the order (percent 0..1)
   * Notice: absolute fee doesn't support now
   */
  fee: number;
}

interface TradeOrder extends TradeOrderArg {
  /** Volume for the order in Quoted units */
  volumeQuoted: number;
  /** Volume for the order in Base units */
  volumeBase: number;
  /** Fee Volume for the order in Quoted units */
  feeVolumeQuoted: number;
  /** Fee Volume for the order in Base units */
  feeVolumeBase: number;
}

export interface TradeVolumeArgs<T = TradeOrderArg> {
  /** Whole Deposit */
  deposit: number;
  /** Maximum risk for the trade (percent 0..1) */
  risk: number;

  /** Entry Orders - Orders for get a position */
  entries: T[];
  /** Stop-Loss Orders - Get rid of the position */
  stops: T[];
}

export interface TradeInfoArgs<T = TradeOrderArg> extends TradeVolumeArgs<T> {
  /** Take-Profit Orders - Distribute the position */
  takes: T[];
}

interface TradeTotalVolumeInfo {
  orders: { quoted: number; base: number };
  fees: { quoted: number; base: number };
}

export interface TradeInfo extends TradeInfoArgs<TradeOrder> {
  totalVolume: {
    entries: TradeTotalVolumeInfo;
    stops: TradeTotalVolumeInfo;
    takes: TradeTotalVolumeInfo;
  };
}

export class ZRisk {

  public constructor(
    private math: ZMath,
  ) {}

  /**
   * @return total volume of the trade in quoted units
   * @todo: test
   */
  public tradeVolumeQuoted({ deposit, risk, entries, stops }: TradeVolumeArgs): number {
    const vRisk = deposit * risk;

    const x = this.math.sumBy(entries, v => v.volumePart * v.fee);
    const y = this.math.sumBy(entries, v => v.volumePart / v.price)
      * (
          this.math.sumBy(stops, v => v.volumePart * v.price)
        + this.math.sumBy(stops, v => v.volumePart * v.fee)
      );

    return vRisk / (1 - x - y); // vSumEntriesQ
  }

  public getTradeInfo(args: TradeInfoArgs): TradeInfo {
    const Pe = args.entries.map(o => o.price);
    const Ie = args.entries.map(o => o.volumePart);
    const Fe = args.entries.map(o => o.fee);

    const Ps = args.stops.map(o => o.price);
    const Is = args.stops.map(o => o.volumePart);
    const Fs = args.stops.map(o => o.fee);

    const Pt = args.takes.map(o => o.price);
    const It = args.takes.map(o => o.volumePart);
    const Ft = args.takes.map(o => o.fee);

    // Entry Volume
    const vSumEntriesQ = this.tradeVolumeQuoted(args);
    const VeQ = Ie.map(v => vSumEntriesQ * v);
    const VeB = VeQ.map((v, i) => v / Pe[i]);
    const vSumEntriesB = this.math.sum(VeB);

    // Stop Volume
    const VsB = Is.map(v => vSumEntriesB * v);
    const VsQ = VsB.map((v, i) => v * Ps[i]);
    const vSumStopsB = this.math.sum(VsB);
    const vSumStopsQ = this.math.sum(VsQ);

    // Take Volume
    const VtB = It.map(v => vSumEntriesB * v);
    const VtQ = VtB.map((v, i) => v * Pt[i]);
    const vSumTakesB = this.math.sum(VtB);
    const vSumTakesQ = this.math.sum(VtQ);

    const { orders: entries, fees: entryFees } = this.getOrdersInfo(args.entries, VeQ, VeB, Fe);
    const { orders: stops,   fees: stopFees }  = this.getOrdersInfo(args.stops,   VsQ, VsB, Fs);
    const { orders: takes,   fees: takeFees }  = this.getOrdersInfo(args.takes,   VtQ, VtB, Ft);

    return {
      ...args,
      entries,
      stops,
      takes,
      totalVolume: {
        entries: {
          orders: { quoted: vSumEntriesQ, base: vSumEntriesB, },
          fees: entryFees,
        },
        stops: {
          orders: { quoted: vSumStopsQ, base: vSumStopsB, },
          fees: stopFees,
        },
        takes: {
          orders: { quoted: vSumTakesQ, base: vSumTakesB, },
          fees: takeFees,
        },
      },
    };
  }

  private getOrdersInfo(
    ordersArg: TradeOrderArg[],
    Vq: number[],
    Vb: number[],
    F: number[],
  ): { orders: TradeOrder[]; } & Pick<TradeTotalVolumeInfo, 'fees'> {
    const fVQ = Vq.map((v, i) => v * F[i]);
    const fVB = Vb.map((v, i) => v * F[i]);

    const orders = ordersArg.map((order, i): TradeOrder => ({
      ...order,
      volumeQuoted:    Vq[i],
      volumeBase:      Vb[i],
      feeVolumeQuoted: fVQ[i],
      feeVolumeBase:   fVB[i],
    }));

    const vSumFeeQ = this.math.sum(fVQ);
    const vSumFeeB = this.math.sum(fVB);
    const fees = { quoted: vSumFeeQ, base: vSumFeeB };

    return { orders, fees };
  }
}

export const zRisk = new ZRisk(zMath);
