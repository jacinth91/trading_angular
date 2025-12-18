import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.isLoading = true;

    setTimeout(() => {
      const success = this.authService.login(this.username, this.password);

      if (success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'Login failed. Please try again.';
      }

      this.isLoading = false;
    }, 500);
  }
}
