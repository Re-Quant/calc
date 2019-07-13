import { PriceAndVolumePart } from './trade-order';
import { ETradeType } from './trade-type.enum';

export interface AvgPrices {
  entry: number;
  stop: number;
  take: number;
}

export interface AvgPricesArgs {
  tradeType: ETradeType;
  entries: PriceAndVolumePart[];
  stops: PriceAndVolumePart[];
  takes: PriceAndVolumePart[];
}

export interface AvgPricesInfo<T = AvgPrices> {
  avgPrices: T;
}
