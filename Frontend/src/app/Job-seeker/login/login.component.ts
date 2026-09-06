import { Component, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-seeker-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;
  
  showPassword = false;
  message = '';
  success = false;
  isLoading = false;

  // Forgot password state
  isForgotPassword = false;
  resetEmail = '';
  newPassword = '';
  confirmPassword = '';
  resetMessage = '';
  resetSuccess = false;
  isResetLoading = false;

  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  togglePassword() {
    this.showPassword = !this.showPassword;
    this.cdr.detectChanges();
  }

  toggleForgotPassword(state: boolean) {
    this.isForgotPassword = state;
    this.resetMessage = '';
    this.message = '';
    if (state && this.email && !this.resetEmail) {
      this.resetEmail = this.email;
    }
    this.cdr.detectChanges();
  }

  login() {
    if (!this.email || !this.password) {
      this.success = false;
      this.message = 'Please fill in all fields.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.message = '';
    this.cdr.detectChanges();

    this.http.post('http://localhost:3000/api/seeker/login', { 
      email: this.email, 
      password: this.password 
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.success = true;
        this.message = 'Login successful! Redirecting...';
        
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('isSeekerLoggedIn', 'true');
          localStorage.setItem('seekerEmail', response.user?.email || this.email);
          if (response.user?.fullName) {
            localStorage.setItem('seekerName', response.user.fullName);
          }
        }
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      },
      error: (err) => {
        this.isLoading = false;
        this.success = false;
        this.message = err.error?.message || 'Invalid email or password.';
        this.cdr.detectChanges();
      }
    });
  }

  submitResetPassword() {
    if (!this.resetEmail || !this.newPassword || !this.confirmPassword) {
      this.resetSuccess = false;
      this.resetMessage = 'Please fill in all fields.';
      this.cdr.detectChanges();
      return;
    }

    if (this.newPassword.length < 6) {
      this.resetSuccess = false;
      this.resetMessage = 'Password must be at least 6 characters.';
      this.cdr.detectChanges();
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.resetSuccess = false;
      this.resetMessage = 'Passwords do not match.';
      this.cdr.detectChanges();
      return;
    }

    this.isResetLoading = true;
    this.resetMessage = '';
    this.cdr.detectChanges();

    this.http.post('http://localhost:3000/api/seeker/forgot-password', {
      email: this.resetEmail,
      newPassword: this.newPassword
    }).subscribe({
      next: (res: any) => {
        this.isResetLoading = false;
        this.resetSuccess = true;
        this.resetMessage = res.message || 'Password reset successful!';
        this.cdr.detectChanges();

        setTimeout(() => {
          this.email = this.resetEmail;
          this.password = '';
          this.isForgotPassword = false;
          this.message = 'Password updated! Please log in with your new password.';
          this.success = true;
          this.cdr.detectChanges();
        }, 1500);
      },
      error: (err) => {
        this.isResetLoading = false;
        this.resetSuccess = false;
        this.resetMessage = err.error?.message || 'Failed to reset password. Please verify your email.';
        this.cdr.detectChanges();
      }
    });
  }
}