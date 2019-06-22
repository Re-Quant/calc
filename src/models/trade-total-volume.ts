export interface TradeTotalVolumeInfo {
  orders: { quoted: number; base: number };
  fees: { quoted: number; base: number };
}

export interface TotalVolumeInfo {
  lossQuoted: number;
  profitQuoted: number;
  entries: TradeTotalVolumeInfo;
  stops: TradeTotalVolumeInfo;
  takes: TradeTotalVolumeInfo;
}
