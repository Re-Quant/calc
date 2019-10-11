import { Volume } from './trade-total-volume';
import { QuotedDiff } from './quoted-diff';

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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TradeOrder extends TradeOrderBase<TradeOrderVolume & {
  /**
   * Deposit change difference.
   *
   * There is 3 cases:
   * - Stop Losses:  Lost money. Has minus sign.
   * - Entries:      Lost money(because of fee, zero in case no fee). Has minus sign.
   * - Take Profits: Earned money. Has plus sign.
   */
  diff: {
    /** Loss or Profit in this order plus fee of this order */
    current: QuotedDiff;
    /**
     * Total loss or Profit or this order with fee of this order and volumes of all previously
     * executed orders and it fees
     */
    total: QuotedDiff;
  };
}> {}
