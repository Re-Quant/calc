import { zMath, ZMath } from './z-math';

// @todo: implement AVG Prices calculation

export enum ETradeType {
  Long = 'long',
  Short = 'short'
}

export interface TradeOrderArg {
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

export interface TradeOrder extends TradeOrderArg {
  /** Volume for the order in Quoted units */
  volumeQuoted: number;
  /** Volume for the order in Base units */
  volumeBase: number;
  /** Fee Volume for the order in Quoted units */
  feeVolumeQuoted: number;
  /** Fee Volume for the order in Base units */
  feeVolumeBase: number;
}

interface DepositAndRisk {
  /** Whole Deposit */
  deposit: number;
  /** Maximum risk for the trade (percent 0..1) */
  risk: number;
}

export interface TradeVolumeArgs<T = TradeOrderArg>
  extends
    DepositAndRisk,
    EntryAndStopOrderGroups<T> {
}

interface EntryAndStopOrderGroups<T = TradeOrderArg> {
  /** Entry Orders - Orders for get a position */
  entries: T[];
  /** Stop-Loss Orders - Get rid of the position */
  stops: T[];
}
interface TakeOrderGroup<T = TradeOrderArg> {
  /** Take-Profit Orders - Distribute the position */
  takes: T[];
}

interface AllOrderGroups<T = TradeOrderArg> extends EntryAndStopOrderGroups<T>, TakeOrderGroup<T> {}

interface FlattenOrdersGroups {
  Pe: number[];
  Ie: number[];
  Fe: number[];

  Ps: number[];
  Is: number[];
  Fs: number[];

  Pt: number[];
  It: number[];
  Ft: number[];
}

export interface OrdersInfoArg<T = TradeOrderArg> extends AllOrderGroups<T> {
  totalTradeVolumeQuoted: number;
  flattenOrderGroups: FlattenOrdersGroups;
}

interface TradeTotalVolumeInfo {
  orders: { quoted: number; base: number };
  fees: { quoted: number; base: number };
}

export interface TotalVolumeInfo {
  lossQuoted: number;
  profitQuoted: number;
  entries: TradeTotalVolumeInfo;
  stops: TradeTotalVolumeInfo;
  takes: TradeTotalVolumeInfo;
}

export interface OrdersInfo extends AllOrderGroups<TradeOrder> {
  totalVolume: TotalVolumeInfo;
}

export interface TradeInfo extends TradeVolumeArgs<TradeOrder>, OrdersInfo {
}

interface LeverageInfoArgs {
  /** Allowed to use leverage? */
  allow: boolean;

  /**
   * Examples:
   * - less  1   - invalid value
   * - equal 1   - no leverage. In case you want to disable leverage using - will be better to set
   *               {@link allow} to false
   * - equal 3   - means max leverage 1:3
   * - equal 3.3 - means max leverage 1:3.3 (on Bitfinex)
   * - equal 100 - means max leverage 1:100 (available on BitMEX or Forex)
   */
  maxTimes: number;
}

interface LeverageInfo extends LeverageInfoArgs {
  /** Actual leverage quantity after final trade sum calculated */
  actualTimes: number;
}

interface TradeVolumeCommonInfoArgs<L = LeverageInfoArgs> extends DepositAndRisk {
  leverage: L;

  /**
   * Maximum trade sum in quoted units.
   * Notice: This value independent of leverage parameters and has bigger priority.
   */
  maxTradeVolumeQuoted: number;
}

export interface TradeVolumeInfoArgs extends TradeVolumeCommonInfoArgs {
  preliminaryVolume: number;
}

// @todo: remove
// interface TradeVolumeCommonInfo extends TradeVolumeCommonInfoArgs<LeverageInfo> {
// }

export interface TradeVolumeInfo extends TradeVolumeCommonInfoArgs<LeverageInfo> {
  totalTradeVolumeQuoted: number;
}

export interface TradeInfoArgs<T = TradeOrderArg>
  extends
    TradeVolumeArgs<T>,
    TakeOrderGroup<T>,
    TradeVolumeCommonInfoArgs {

  tradeType: ETradeType;
}

export class ZRisk {

  public constructor(
    private math: ZMath,
  ) {}

  /**
   * @return total volume of the trade in quoted units
   */
  public getLongTradeVolumeQuoted({ deposit, risk, entries, stops }: TradeVolumeArgs): number {
    const vRisk = deposit * risk;

    const x = this.math.sumBy(entries, v => v.volumePart * v.fee);
    const y = this.math.sumBy(entries, v => v.volumePart / v.price)
      * (
          this.math.sumBy(stops, v => v.volumePart * v.price * v.fee)
        - this.math.sumBy(stops, v => v.volumePart * v.price)
      );

    return vRisk / (1 + x + y); // vSumEntriesQ
  }

  public getShortTradeVolumeQuoted({ deposit, risk, entries, stops }: TradeVolumeArgs): number {
    const vRisk = deposit * risk;

    const x  = this.math.sumBy(entries, v => v.volumePart / v.price);
    const y  = this.math.sumBy(stops,   v => v.volumePart / v.price);
    const fe = this.math.sumBy(entries, v => v.volumePart * v.fee);
    const fs = this.math.sumBy(stops,   v => v.volumePart * v.fee);

    return vRisk / (x / y - 1 + fe + fs); // vSumEntriesQ
  }

  public manageTradeVolume({ preliminaryVolume, ...p }: TradeVolumeInfoArgs): TradeVolumeInfo {
    let totalTradeVolumeQuoted = preliminaryVolume;
    const preliminaryLeverage = totalTradeVolumeQuoted / p.deposit;

    let actualTimes = preliminaryLeverage;
    if (p.leverage.allow) {
      if (actualTimes < 1) { actualTimes = 1; }
      if (actualTimes > p.leverage.maxTimes) { actualTimes = p.leverage.maxTimes; }
    } else {
      actualTimes = 1;
    }

    if (preliminaryLeverage > actualTimes) {
      totalTradeVolumeQuoted = p.deposit * actualTimes;
    }

    if (totalTradeVolumeQuoted > p.maxTradeVolumeQuoted) {
      totalTradeVolumeQuoted = p.maxTradeVolumeQuoted;

      const times = totalTradeVolumeQuoted / p.deposit;
      if (actualTimes > times) { actualTimes = times; }
    }

    const leverage = {
      ...p.leverage,
      actualTimes,
    };
    return {
      ...p,
      leverage,
      totalTradeVolumeQuoted,
    };
  }

  public getTradeInfo(p: TradeInfoArgs): TradeInfo {
    const preliminaryVolume = p.tradeType === ETradeType.Long
                                   ? this.getLongTradeVolumeQuoted(p)
                                   : this.getShortTradeVolumeQuoted(p);

    const { totalTradeVolumeQuoted, ...tradeVolumeInfo }
            = this.manageTradeVolume({ ...p, preliminaryVolume });

    const flattenOrderGroups = this.flattenOrdersInfoArgs(p);

    const orderInfoArgs = { ...p, totalTradeVolumeQuoted, flattenOrderGroups };
    const ordersInfo = p.tradeType === ETradeType.Long
                       ? this.getLongTradeOrdersInfo(orderInfoArgs)
                       : this.getShortTradeOrdersInfo(orderInfoArgs);

    return {
      ...p,
      ...tradeVolumeInfo,
      ...ordersInfo,
    };
  }

  private getLongTradeOrdersInfo(p: OrdersInfoArg): OrdersInfo {
    const { Pe, Ie, Fe,
            Ps, Is, Fs,
            Pt, It, Ft, } = p.flattenOrderGroups;

    // Entry Volume
    const vSumEntriesQ = p.totalTradeVolumeQuoted;  /* ? */
    const VeQ = Ie.map(v => vSumEntriesQ * v);
    const VeB = VeQ.map((v, i) => v / Pe[i]);
    const vSumEntriesB = this.math.sum(VeB);

    // Stop Volume
    const VsB = Is.map(v => vSumEntriesB * v);
    const VsQ = VsB.map((v, i) => v * Ps[i]);
    const vSumStopsB = this.math.sum(VsB);
    const vSumStopsQ = this.math.sum(VsQ);  /* ? */

    // Take Volume
    const VtB = It.map(v => vSumEntriesB * v);
    const VtQ = VtB.map((v, i) => v * Pt[i]);
    const vSumTakesB = this.math.sum(VtB);
    const vSumTakesQ = this.math.sum(VtQ);

    // Fee & Totals by order type
    const { orders: entries, fees: entryFees } = this.getOrdersGroupInfo(p.entries, VeQ, VeB, Fe);
    const { orders: stops,   fees: stopFees }  = this.getOrdersGroupInfo(p.stops,   VsQ, VsB, Fs);
    const { orders: takes,   fees: takeFees }  = this.getOrdersGroupInfo(p.takes,   VtQ, VtB, Ft);

    // Total max loss and max profit
    const lossQuoted   = vSumEntriesQ - vSumStopsQ + entryFees.quoted + stopFees.quoted;
    const profitQuoted = vSumTakesQ - vSumEntriesQ - takeFees.quoted - entryFees.quoted;

    return {
      entries,
      stops,
      takes,
      totalVolume: {
        lossQuoted,
        profitQuoted,
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
  } // end getLongTradeOrdersInfo()

  private getShortTradeOrdersInfo(p: OrdersInfoArg): OrdersInfo {
    const { Pe, Ie, Fe,
            Ps, Is, Fs,
            Pt, It, Ft, } = p.flattenOrderGroups;

    // Entry Volume
    const vSumEntriesQ = p.totalTradeVolumeQuoted;  /* ? */
    const VeQ = Ie.map(v => vSumEntriesQ * v);
    const VeB = VeQ.map((v, i) => v / Pe[i]);
    const vSumEntriesB = this.math.sum(VeB);

    // Stop Volume
    const VsQ = Is.map(v => vSumEntriesQ * v);
    const VsB = VsQ.map((v, i) => v / Ps[i]);
    const vSumStopsQ = this.math.sum(VsQ); /* ? */
    const vSumStopsB = this.math.sum(VsB); /* ? */

    // Take Volume
    const VtQ = It.map(v => vSumEntriesQ * v);
    const VtB = VtQ.map((v, i) => v / Pt[i]);
    const vSumTakesQ = this.math.sum(VtQ); /* ? */
    const vSumTakesB = this.math.sum(VtB); /* ? */

    // Fee & Totals by order type
    const { orders: entries, fees: entryFees } = this.getOrdersGroupInfo(p.entries, VeQ, VeB, Fe);
    const { orders: stops,   fees: stopFees }  = this.getOrdersGroupInfo(p.stops,   VsQ, VsB, Fs);
    const { orders: takes,   fees: takeFees }  = this.getOrdersGroupInfo(p.takes,   VtQ, VtB, Ft);

    // Total max loss and max profit
    const vSumLossQ = (vSumEntriesB - vSumStopsB) / this.math.sumBy(Is, (v, i) => v / Ps[i]);
    const lossQuoted   = vSumLossQ + entryFees.quoted + stopFees.quoted;

    const vSumProfitQ = (vSumTakesB - vSumEntriesB) / this.math.sumBy(It, (v, i) => v / Pt[i]);
    const profitQuoted = vSumProfitQ - takeFees.quoted - entryFees.quoted;

    return {
      entries,
      stops,
      takes,
      totalVolume: {
        lossQuoted,
        profitQuoted,
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
  } // end getLongTradeOrdersInfo()

  private getOrdersGroupInfo(
    ordersArg: TradeOrderArg[],
    Vq: number[],
    Vb: number[],
    F: number[],
  ): { orders: TradeOrder[]; } & Pick<TradeTotalVolumeInfo, 'fees'> {
    const FvQ = Vq.map((v, i) => v * F[i]);
    const FvB = Vb.map((v, i) => v * F[i]);

    const orders = ordersArg.map((order, i): TradeOrder => ({
      ...order,
      volumeQuoted:     Vq[i],
      volumeBase:       Vb[i],
      feeVolumeQuoted: FvQ[i],
      feeVolumeBase:   FvB[i],
    }));

    const vSumFeeQ = this.math.sum(FvQ);
    const vSumFeeB = this.math.sum(FvB);
    const fees = { quoted: vSumFeeQ, base: vSumFeeB };

    return { orders, fees };
  }

  private flattenOrdersInfoArgs({ entries, stops, takes }: AllOrderGroups): FlattenOrdersGroups {
    const Pe: number[] = [];
    const Ie: number[] = [];
    const Fe: number[] = [];

    const Ps: number[] = [];
    const Is: number[] = [];
    const Fs: number[] = [];

    const Pt: number[] = [];
    const It: number[] = [];
    const Ft: number[] = [];

    for (let i = 0, ilen = entries.length; i < ilen; i++) {
      const o = entries[i];
      Pe[i] = o.price;
      Ie[i] = o.volumePart;
      Fe[i] = o.fee;
    }

    for (let i = 0, ilen = stops.length; i < ilen; i++) {
      const o = stops[i];
      Ps[i] = o.price;
      Is[i] = o.volumePart;
      Fs[i] = o.fee;
    }

    for (let i = 0, ilen = takes.length; i < ilen; i++) {
      const o = takes[i];
      Pt[i] = o.price;
      It[i] = o.volumePart;
      Ft[i] = o.fee;
    }

    return {
      Pe, Ie, Fe,
      Ps, Is, Fs,
      Pt, It, Ft,
    };
  }

}

export const zRisk = new ZRisk(zMath);
