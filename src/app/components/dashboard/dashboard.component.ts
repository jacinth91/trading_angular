import { Component, OnInit, signal, computed } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { io, Socket } from 'socket.io-client';
import { ColDef, GridApi, GridOptions, GridReadyEvent, ValueFormatterParams } from 'ag-grid-community';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SupabaseService, Stock } from '../../services/supabase.service';
import { Trade, MarketData, PortfolioItem } from '../../models/trading.types';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule,AgGridAngular],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private socket!: Socket;
  private gridApi!: GridApi;
  getRowId = (params: any) => params.data.symbol;
  username: string = '';
  recentTrades: Trade[] = [];
  marketData: MarketData[] = [];
  portfolio: PortfolioItem[] = [];

  showStocksModal = signal<boolean>(false);
  stocks = signal<Stock[]>([]);
  searchQuery = signal<string>('');
  isLoadingStocks = signal<boolean>(false);
  selectedStock = signal<Stock | null>(null);

  filteredStocks = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const allStocks = this.stocks();

    if (!query) {
      return allStocks;
    }

    return allStocks.filter(stock =>
      stock.symbol.toLowerCase().includes(query) ||
      stock.name.toLowerCase().includes(query) ||
      stock.sector.toLowerCase().includes(query)
    );
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.username = this.authService.getUsername();
    this.loadMockData();
  }

  loadMockData(): void {
    this.recentTrades = [
      {
        id: 'T001',
        symbol: 'DFM',
        type: 'BUY',
        quantity: 500,
        price: 12.45,
        total: 6225,
        date: new Date('2025-12-17T09:30:00'),
        status: 'COMPLETED'
      },
      {
        id: 'T002',
        symbol: 'ADX',
        type: 'SELL',
        quantity: 300,
        price: 28.90,
        total: 8670,
        date: new Date('2025-12-17T10:15:00'),
        status: 'COMPLETED'
      },
      {
        id: 'T003',
        symbol: 'EMAAR',
        type: 'BUY',
        quantity: 250,
        price: 45.60,
        total: 11400,
        date: new Date('2025-12-17T11:20:00'),
        status: 'COMPLETED'
      },
      {
        id: 'T004',
        symbol: 'TAQA',
        type: 'BUY',
        quantity: 1000,
        price: 8.75,
        total: 8750,
        date: new Date('2025-12-17T13:45:00'),
        status: 'PENDING'
      },
      {
        id: 'T005',
        symbol: 'ADNOC',
        type: 'SELL',
        quantity: 400,
        price: 33.20,
        total: 13280,
        date: new Date('2025-12-17T14:30:00'),
        status: 'COMPLETED'
      }
    ];

    // this.marketData = [
    //   {
    //     symbol: 'DFM',
    //     name: 'Dubai Financial Market',
    //     price: 12.45,
    //     change: 0.35,
    //     changePercent: 2.89,
    //     volume: '2.5M'
    //   },
    //   {
    //     symbol: 'EMAAR',
    //     name: 'Emaar Properties',
    //     price: 45.60,
    //     change: -0.80,
    //     changePercent: -1.72,
    //     volume: '1.8M'
    //   },
    //   {
    //     symbol: 'ADNOC',
    //     name: 'ADNOC Distribution',
    //     price: 33.20,
    //     change: 1.15,
    //     changePercent: 3.59,
    //     volume: '3.2M'
    //   },
    //   {
    //     symbol: 'TAQA',
    //     name: 'Abu Dhabi National Energy',
    //     price: 8.75,
    //     change: 0.12,
    //     changePercent: 1.39,
    //     volume: '5.1M'
    //   },
    //   {
    //     symbol: 'ADX',
    //     name: 'Abu Dhabi Securities Exchange',
    //     price: 28.90,
    //     change: -0.45,
    //     changePercent: -1.53,
    //     volume: '1.2M'
    //   }
    // ];

    this.portfolio = [
      {
        symbol: 'DFM',
        name: 'Dubai Financial Market',
        quantity: 1500,
        avgPrice: 11.80,
        currentPrice: 12.45,
        totalValue: 18675,
        profitLoss: 975,
        profitLossPercent: 5.51
      },
      {
        symbol: 'EMAAR',
        name: 'Emaar Properties',
        quantity: 800,
        avgPrice: 44.20,
        currentPrice: 45.60,
        totalValue: 36480,
        profitLoss: 1120,
        profitLossPercent: 3.17
      },
      {
        symbol: 'ADNOC',
        name: 'ADNOC Distribution',
        quantity: 1200,
        avgPrice: 31.50,
        currentPrice: 33.20,
        totalValue: 39840,
        profitLoss: 2040,
        profitLossPercent: 5.40
      },
      {
        symbol: 'TAQA',
        name: 'Abu Dhabi National Energy',
        quantity: 3000,
        avgPrice: 8.50,
        currentPrice: 8.75,
        totalValue: 26250,
        profitLoss: 750,
        profitLossPercent: 2.94
      }
    ];
  }

  async navigateToStocks(): Promise<void> {
    this.showStocksModal.set(true);
    await this.loadStocks();
  }

  async loadStocks(): Promise<void> {
    this.isLoadingStocks.set(true);
    const data = await this.supabaseService.getStocks();
    this.stocks.set(data);
    this.isLoadingStocks.set(false);
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  selectStock(stock: Stock): void {
    this.selectedStock.set(stock);
  }

  buyStock(stock: Stock, event: Event): void {
    event.stopPropagation();
    alert(`Buy order placed for ${stock.symbol} (${stock.name}) at AED ${stock.current_price}`);
  }

  closeStocksModal(): void {
    this.showStocksModal.set(false);
    this.searchQuery.set('');
  }

  closeStockDetail(): void {
    this.selectedStock.set(null);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 120,
    cellClass: 'cell-center',
    headerClass: 'header-center',
  };
  onGridReady(e: GridReadyEvent) {
    this.gridApi = e.api;
    this.connectSocket();
  }
  private connectSocket() {
    this.socket = io('http://localhost:3000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 3000,
    });

    
    this.socket.on('market:snapshot', (rows: any[]) => {
      this.marketData = rows;
      
    });

    
    this.socket.on('market:update', (u: { symbol: string; price: number; changePercent: number }) => {
      this.gridApi.applyTransaction({
        update: [{ symbol: u.symbol, price: u.price, changePercent: u.changePercent }],
      });
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connect error:', err?.message || err);
    });
  }

  gridOptions: GridOptions = {
    rowHeight: 44,
    headerHeight: 44,
    animateRows: true,
    domLayout: 'normal', 
    
  };

  private currencyFormatter = (p: ValueFormatterParams) =>
    this.formatCurrency(Number(p.value ?? 0));

  marketColDefs: ColDef[] = [
    { headerName: 'Symbol', field: 'symbol', minWidth: 110 },
    { headerName: 'Name', field: 'name', minWidth: 180 },
    {
      headerName: 'Price',
      field: 'price',
      valueFormatter: this.currencyFormatter,
      
      minWidth: 130,
    },
    {
      headerName: 'Change',
      field: 'changePercent',
      valueFormatter: (p) => `${Number(p.value ?? 0) > 0 ? '+' : ''}${Number(p.value ?? 0).toFixed(2)}%`,
      cellClassRules: {
        'cell-pos': (p) => Number(p.value ?? 0) > 0,
        'cell-neg': (p) => Number(p.value ?? 0) < 0,
      },
      minWidth: 130,
    },
    {
      headerName: 'Volume',
      field: 'volume',
      
      minWidth: 130,
    },
  ];

  tradesColDefs: ColDef[] = [
    { headerName: 'ID', field: 'id', minWidth: 110 },
    { headerName: 'Symbol', field: 'symbol', minWidth: 120 },
    {
      headerName: 'Side',
      field: 'type',
      valueFormatter: (p) => (p.value === 'BUY' ? 'Buy' : 'Sell'),
      cellClassRules: {
        'tag-buy': (p) => p.value === 'BUY',
        'tag-sell': (p) => p.value === 'SELL',
      },
      minWidth: 120,
    },
    { headerName: 'Qty', field: 'quantity', minWidth: 110 },
    {
      headerName: 'Total',
      field: 'total',
      valueFormatter: this.currencyFormatter,
      
      minWidth: 140,
    },
    {
      headerName: 'Status',
      field: 'status',
      valueFormatter: (p) => (p.value === 'COMPLETED' ? 'Completed' : 'Pending'),
      cellClassRules: {
        'status-ok': (p) => p.value === 'COMPLETED',
        'status-warn': (p) => p.value === 'PENDING',
      },
      minWidth: 140,
    },
  ];

  portfolioColDefs: ColDef[] = [
    { headerName: 'Symbol', field: 'symbol', minWidth: 120 },
    { headerName: 'Name', field: 'name', minWidth: 200 },
    { headerName: 'Qty', field: 'quantity', minWidth: 110 },
    { headerName: 'Avg', field: 'avgPrice', valueFormatter: this.currencyFormatter, minWidth: 120 },
    { headerName: 'Current', field: 'currentPrice', valueFormatter: this.currencyFormatter, minWidth: 130 },
    { headerName: 'Value', field: 'totalValue', valueFormatter: this.currencyFormatter, minWidth: 140 },
    {
      headerName: 'P&L',
      field: 'profitLoss',
      valueFormatter: this.currencyFormatter,
      cellClassRules: {
        'cell-pos': (p) => Number(p.value ?? 0) > 0,
        'cell-neg': (p) => Number(p.value ?? 0) < 0,
      },
      
      minWidth: 140,
    },
  ];

  // your existing
  formatCurrency(value: number) {
    return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(value);
  }

  

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-AE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  ngOnDestroy() {
    this.socket?.disconnect();
  }
}
