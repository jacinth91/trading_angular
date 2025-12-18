import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  constructor() {}

  login(username: string, password: string): boolean {
    localStorage.setItem('auth_token', 'true');
    localStorage.setItem('username', username);
    this.isAuthenticatedSubject.next(true);
    return true;
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('username');
    this.isAuthenticatedSubject.next(false);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getUsername(): string {
    return localStorage.getItem('username') || '';
  }

  private hasToken(): boolean {
    return localStorage.getItem('auth_token') === 'true';
  }
}
