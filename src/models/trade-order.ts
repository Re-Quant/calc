import { Volume } from './trade-total-volume';

export interface PriceAndVolumePart {
  /** Price for the order execution */
  price: number;
  /** Part of total volume for this trade (percent 0..1) */
  volumePart: number;
}

export interface TradeOrderArg extends PriceAndVolumePart {
  /**
   * Fee for the order (percent 0..1)
   * @todo: implement absolute fee, it's no support now
   */
  fee: number;
}

interface TradeOrderVolume {
  order: Volume;
  fee: Volume;

  sumWithPrev: {
    orders: Volume;
    fees: Volume;
  };
}

export interface TradeOrderBase<T = TradeOrderVolume> extends TradeOrderArg {
  volume: T;
}

// @todo: implement it
// export interface TradeOrderStopAndTake extends TradeOrderEntry<TradeOrderVolume & {
//   /**
//    * Loss money in case the interface used for describe Stop Loss. Has minus sign.
//    * Profit money in case the interface used for describe Take Profit. Has minus sign.
//    */
//   diff: {
//     current: Volume & { percent: number };
//     sumWithPrev: Volume & { percent: number };
//   };
// }> {}
