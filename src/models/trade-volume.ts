import { TradeOrderArg } from './trade-order';
import { EntryAndStopOrderGroups } from './order-groups';

export interface DepositAndRisk {
  /** Whole Deposit */
  deposit: number;
  /** Maximum risk for the trade (percent 0..1) */
  risk: number;
}

export interface LeverageInfoArgs {
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

export interface LeverageInfo extends LeverageInfoArgs {
  /** Actual leverage quantity after final trade sum calculated */
  actualTimes: number;
}

export interface TradeVolumeArgs<T = TradeOrderArg>
  extends
    DepositAndRisk,
    EntryAndStopOrderGroups<T> {}

export interface TradeVolumeCommonInfoArgs<L = LeverageInfoArgs> extends DepositAndRisk {
  leverage: L;

  /**
   * Maximum trade sum in quoted units.
   * Notice: This value independent of leverage parameters and has bigger priority.
   */
  maxTradeVolumeQuoted: number;
}

export interface TradeVolumeCommonInfo extends TradeVolumeCommonInfoArgs<LeverageInfo> {
}

export interface TradeVolumeManagementArgs extends TradeVolumeCommonInfoArgs {
  preliminaryVolume: number;
}

export interface TradeVolumeManagement extends TradeVolumeCommonInfoArgs<LeverageInfo> {
  totalTradeVolumeQuoted: number;
}
