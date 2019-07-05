import { QuotedDiff } from './quoted-diff';

export interface Volume {
  quoted: number;
  base: number;
}

export interface TradeTotalVolumeInfo {
  orders: { quoted: number; base: number };
  fees: { quoted: number; base: number };
}

export interface TotalVolumeInfo {
  loss: QuotedDiff;
  profit: QuotedDiff;
  entries: TradeTotalVolumeInfo;
  stops: TradeTotalVolumeInfo;
  takes: TradeTotalVolumeInfo;
}
