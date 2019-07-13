import { TradeVolumeArgs, TradeVolumeCommonInfo, TradeVolumeCommonInfoArgs } from './trade-volume';
import { TradeOrder, TradeOrderArg } from './trade-order';
import { OrdersInfo } from './orders-info';
import { TakeOrderGroup } from './order-groups';
import { TradeTypeInfo } from './trade-type.enum';
import { AvgPricesInfo } from './avg-prices';
import { BreakevenTradeInfo, BreakevenTradeInfoArgs } from './breakeven';
import { MarginCallInfo } from './margin-call';

export interface TradeInfo
  extends
    TradeVolumeArgs<TradeOrder>,
    OrdersInfo,
    TradeVolumeCommonInfo,
    TradeTypeInfo,
    BreakevenTradeInfo,
    MarginCallInfo,
    AvgPricesInfo {}

export interface TradeInfoArgs<T = TradeOrderArg>
  extends
    TradeVolumeArgs<T>,
    TakeOrderGroup<T>,
    TradeVolumeCommonInfoArgs,
    TradeTypeInfo,
    BreakevenTradeInfoArgs {}
