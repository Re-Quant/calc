import { AllOrderGroups, FlattenOrdersGroups } from './order-groups';
import { TradeOrder, TradeOrderArg } from './trade-order';
import { TotalVolumeInfo } from './trade-total-volume';

export interface OrdersInfoArg<T = TradeOrderArg> extends AllOrderGroups<T> {
  totalTradeVolumeQuoted: number;
  flattenOrderGroups: FlattenOrdersGroups;
}

export interface OrdersInfo extends AllOrderGroups<TradeOrder> {
  totalVolume: TotalVolumeInfo;
}
