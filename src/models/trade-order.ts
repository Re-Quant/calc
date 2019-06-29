export interface PriceAndVolumePart {
  /** Price for the order execution */
  price: number;
  /** Part of total volume for this trade (percent 0..1) */
  volumePart: number;
}

export interface TradeOrderArg extends PriceAndVolumePart {
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
