import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-company-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;
  
  showPassword = false;
  message = '';

  constructor(private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    if (!this.email || !this.password) {
      this.message = 'Please enter your email and password.';
      return;
    }

    console.log('Company Logged In:', this.email);

    // Set company as logged in and instantly redirect to home
    localStorage.setItem('isCompanyLoggedIn', 'true');
    this.router.navigate(['/']);
  }
}