interface BreakevenInfoArgs {
  /** Fee percent of the Breakeven Order. Number in range 0..1 */
  fee: number;
}

export interface BreakevenInfo extends BreakevenInfoArgs {
  /** Price of the Breakeven Order execution */
  price: number;
}

export interface BreakevenTradeInfoArgs<T = BreakevenInfoArgs> {
  breakeven: T;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BreakevenTradeInfo extends BreakevenTradeInfoArgs<BreakevenInfo> {}

export interface BreakevenPriceArgs extends BreakevenTradeInfoArgs {
  totalVolume: {
    entries: {
      orders: { quoted: number; base: number };
      fees: { quoted: number };
    };
  };
}
