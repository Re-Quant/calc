import { TradeOrderArg } from './trade-order';

export interface EntryAndStopOrderGroups<T = TradeOrderArg> {
  /** Entry Orders - Orders for get a position */
  entries: T[];
  /** Stop-Loss Orders - Get rid of the position */
  stops: T[];
}

export interface TakeOrderGroup<T = TradeOrderArg> {
  /** Take-Profit Orders - Distribute the position */
  takes: T[];
}

export interface AllOrderGroups<T = TradeOrderArg>
  extends
    EntryAndStopOrderGroups<T>,
    TakeOrderGroup<T> {}

export interface FlattenOrdersGroups {
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
