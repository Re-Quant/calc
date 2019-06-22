import { TradeVolumeArgs, TradeVolumeCommonInfoArgs } from './trade-volume';
import { TradeOrder, TradeOrderArg } from './trade-order';
import { OrdersInfo } from './orders-info';
import { TakeOrderGroup } from './order-groups';
import { ETradeType } from './trade-type.enum';

export interface TradeInfo extends TradeVolumeArgs<TradeOrder>, OrdersInfo {
}

export interface TradeInfoArgs<T = TradeOrderArg>
  extends TradeVolumeArgs<T>,
    TakeOrderGroup<T>,
    TradeVolumeCommonInfoArgs {

  tradeType: ETradeType;
}
