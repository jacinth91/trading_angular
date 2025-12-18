import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService, Stock } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-stocks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})
export class StocksComponent implements OnInit {
  stocks = signal<Stock[]>([]);
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(true);
  selectedStock = signal<Stock | null>(null);
  username = signal<string>('');

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
    private supabaseService: SupabaseService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.username.set(this.authService.getUsername());
    await this.loadStocks();
  }

  async loadStocks(): Promise<void> {
    this.isLoading.set(true);
    const data = await this.supabaseService.getStocks();
    this.stocks.set(data);
    this.isLoading.set(false);
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

  closeModal(): void {
    this.selectedStock.set(null);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
