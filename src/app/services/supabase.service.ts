import { Injectable } from '@angular/core';
import stocksData from '../data/stocks.json';

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  market: string;
  sector: string;
  current_price: number;
  change_percent: number;
  volume: number;
  market_cap: number;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private stocks: Stock[] = stocksData;

  constructor() {}

  async getStocks(): Promise<Stock[]> {
    return [...this.stocks].sort((a, b) => a.symbol.localeCompare(b.symbol));
  }

  async getStockBySymbol(symbol: string): Promise<Stock | null> {
    const stock = this.stocks.find(s => s.symbol === symbol);
    return stock || null;
  }

  async searchStocks(query: string): Promise<Stock[]> {
    const lowerQuery = query.toLowerCase();
    return this.stocks
      .filter(stock =>
        stock.symbol.toLowerCase().includes(lowerQuery) ||
        stock.name.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => a.symbol.localeCompare(b.symbol));
  }
}
