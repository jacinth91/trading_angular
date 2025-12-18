export interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  date: Date;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
}

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
}

export interface PortfolioItem {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercent: number;
}
