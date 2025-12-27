export type MarketType = 'USA' | 'INDIA' | 'CRYPTO';

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number; // in billions
  sector: string;
  peRatio?: number;
  high52Week: number;
  low52Week: number;
  market: MarketType;
  history: { time: string; price: number }[]; // Mock history for charts
}

export interface StockFilter {
  minCap: number;
  maxCap: number;
  sectors: string[];
  minVolume: number;
  pattern?: 'Bullish' | 'Bearish' | 'Neutral' | 'All';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Watchlist {
  id: string;
  name: string;
  symbols: string[];
}
