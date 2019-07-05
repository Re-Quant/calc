import { zMath, ZMath } from './z-math';
import {
  AllOrderGroups,
  AvgPrices,
  AvgPricesArgs, BreakevenInfo, BreakevenPriceArgs,
  ETradeType,
  FlattenOrdersGroups,
  OrdersInfo,
  OrdersInfoArg,
  PriceAndVolumePart,
  TradeInfo,
  TradeInfoArgs,
  TradeOrderArg,
  TradeOrderBase,
  TradeVolumeArgs,
  TradeVolumeManagement,
  TradeVolumeManagementArgs,
  Volume,
} from './models';

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

  /**
   * @return total volume of the trade in quoted units
   */
  public getShortTradeVolumeQuoted({ deposit, risk, entries, stops }: TradeVolumeArgs): number {
    const vRisk = deposit * risk;

    const x  = this.math.sumBy(entries, v => v.volumePart / v.price);
    const y  = this.math.sumBy(stops,   v => v.volumePart / v.price);
    const fe = this.math.sumBy(entries, v => v.volumePart * v.fee);
    const fs = this.math.sumBy(stops,   v => v.volumePart * v.fee);

    return vRisk / (x / y - 1 + fe + fs); // vSumEntriesQ
  }

  public manageTradeVolume(
    { preliminaryVolume, ...p }: TradeVolumeManagementArgs,
  ): TradeVolumeManagement {
    let totalTradeVolumeQuoted = preliminaryVolume;
    const preliminaryLeverage = totalTradeVolumeQuoted / p.deposit;

    let actual = preliminaryLeverage;
    if (p.leverage.allow) {
      if (actual < 1) { actual = 1; }
      if (actual > p.leverage.max) { actual = p.leverage.max; }
    } else {
      actual = 1;
    }

    if (preliminaryLeverage > actual) {
      totalTradeVolumeQuoted = p.deposit * actual;
    }

    if (totalTradeVolumeQuoted > p.maxTradeVolumeQuoted) {
      totalTradeVolumeQuoted = p.maxTradeVolumeQuoted;

      const times = totalTradeVolumeQuoted / p.deposit;
      if (actual > times) { actual = times; }
    }

    const leverage = {
      ...p.leverage,
      actual,
    };
    return {
      ...p,
      leverage,
      totalTradeVolumeQuoted,
    };
  }

  /**
   * Calculates average price for case when you want cut {@link PriceAndVolumePart.volumePart}
   * of the total volume in quoted units
   */
  public avgPriceOfQuoted(orders: PriceAndVolumePart[]): number {
    return 1 / this.math.sumBy(orders, v => v.volumePart / v.price);
  }

  /**
   * Calculates average price for case when you want cut {@link PriceAndVolumePart.volumePart}
   * of the total volume in base units
   */
  public avgPriceOfBase(orders: PriceAndVolumePart[]): number {
    return this.math.sumBy(orders, v => v.volumePart * v.price);
  }

  public breakevenPrice({ totalVolume: tv, breakeven }: BreakevenPriceArgs): number {
    return (tv.entries.orders.quoted + tv.entries.fees.quoted)
        / ((tv.entries.orders.base) * (1 - breakeven.fee));
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

    const avgPrices = this.getAvgPricesInfo(p);

    const breakeven: BreakevenInfo = {
      ...p.breakeven,
      price: this.breakevenPrice({ ...p, ...ordersInfo }),
    };

    return {
      ...p,
      ...tradeVolumeInfo,
      ...ordersInfo,
      breakeven,
      avgPrices,
    };
  }

  private getAvgPricesInfo(p: AvgPricesArgs): AvgPrices {
    return p.tradeType === ETradeType.Long
           ? {
             entry: this.avgPriceOfQuoted(p.entries),
             stop:  this.avgPriceOfBase(p.stops),
             take:  this.avgPriceOfBase(p.takes), }
           : {
             entry: this.avgPriceOfQuoted(p.entries),
             stop:  this.avgPriceOfQuoted(p.stops),
             take:  this.avgPriceOfQuoted(p.takes),
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
    const vSumEntriesB = this.math.sum(VeB);  /* ? */

    // Stop Volume
    const VsB = Is.map(v => vSumEntriesB * v);
    const VsQ = VsB.map((v, i) => v * Ps[i]);
    const vSumStopsB = this.math.sum(VsB);  /* ? */
    const vSumStopsQ = this.math.sum(VsQ);  /* ? */

    // Take Volume
    const VtB = It.map(v => vSumEntriesB * v);
    const VtQ = VtB.map((v, i) => v * Pt[i]);
    const vSumTakesB = this.math.sum(VtB);
    const vSumTakesQ = this.math.sum(VtQ);

    // Fee & Totals by order type
    const [entries, entryFees] = this.getOrdersGroupVolumes(p.entries, VeQ, VeB, Fe);
    const [stops, stopFees]    = this.getOrdersGroupVolumes(p.stops,   VsQ, VsB, Fs);
    const [takes, takeFees]    = this.getOrdersGroupVolumes(p.takes,   VtQ, VtB, Ft);

    // Total max loss and max profit
    const lossQuoted   = vSumEntriesQ - vSumStopsQ + entryFees.quoted + stopFees.quoted;
    const profitQuoted = vSumTakesQ - vSumEntriesQ - takeFees.quoted - entryFees.quoted;

    return {
      entries,
      stops,
      takes,
      totalVolume: {
        loss: { quoted: lossQuoted, percent: lossQuoted / p.deposit },
        profit: { quoted: profitQuoted, percent: profitQuoted / p.deposit },
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
    const [entries, entryFees] = this.getOrdersGroupVolumes(p.entries, VeQ, VeB, Fe);
    const [stops, stopFees]    = this.getOrdersGroupVolumes(p.stops,   VsQ, VsB, Fs);
    const [takes, takeFees]    = this.getOrdersGroupVolumes(p.takes,   VtQ, VtB, Ft);

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
        loss: { quoted: lossQuoted, percent: lossQuoted / p.deposit },
        profit: { quoted: profitQuoted, percent: profitQuoted / p.deposit },
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

  private getOrdersGroupVolumes(
    ordersArg: TradeOrderArg[],
    Vq: number[],
    Vb: number[],
    F: number[],
  ): [TradeOrderBase[], Volume] {
    const FvQ = Vq.map((v, i) => v * F[i]);
    const FvB = Vb.map((v, i) => v * F[i]);

    let [sumOrdersQuoted, sumOrdersBase, sumFeesQuoted, sumFeesBase] = [0, 0, 0, 0];
    const orders = ordersArg.map((order, i): TradeOrderBase => {
      sumOrdersQuoted += Vq[i];
      sumOrdersBase   += Vb[i];
      sumFeesQuoted   += FvQ[i];
      sumFeesBase     += FvB[i];

      return {
        ...order,
        volume: {
          sumWithPrev: {
            orders: { quoted: sumOrdersQuoted, base: sumOrdersBase },
            fees:   { quoted: sumFeesQuoted,   base: sumFeesBase },
          },
          order: { quoted:  Vq[i], base:  Vb[i] },
          fee:   { quoted: FvQ[i], base: FvB[i] },
        },
      };
    });

    const vSumFeeQ = this.math.sum(FvQ);
    const vSumFeeB = this.math.sum(FvB);
    const fees = { quoted: vSumFeeQ, base: vSumFeeB };

    return [orders, fees];
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
