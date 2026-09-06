import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-company-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  rememberMe = false;
  
  showPassword = false;
  message = '';
  success = false;

  // Forgot password state
  isForgotPassword = false;
  resetEmail = '';
  newPassword = '';
  confirmPassword = '';
  resetMessage = '';
  resetSuccess = false;
  isResetLoading = false;

  constructor(
    private router: Router, 
    private route: ActivatedRoute, 
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['forgot'] === 'true') {
        this.isForgotPassword = true;
        this.cdr.detectChanges();
      }
    });
  }

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
      this.message = 'Please enter your email and password.';
      this.cdr.detectChanges();
      return;
    }

    const loginData = {
      email: this.email,
      password: this.password
    };

    this.http.post('http://localhost:3000/api/company/login', loginData).subscribe({
      next: (response: any) => {
        this.success = true;
        this.message = 'Login successful! Redirecting...';

        localStorage.setItem('isCompanyLoggedIn', 'true');
        localStorage.setItem('companyEmail', this.email);
        if (response.company && response.company.companyName) {
          localStorage.setItem('companyName', response.company.companyName);
        }
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      },
      error: (err) => {
        this.success = false;
        this.message = err.error?.message || 'Login failed. Please check your credentials.';
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

    this.http.post('http://localhost:3000/api/company/forgot-password', {
      email: this.resetEmail,
      newPassword: this.newPassword
    }).subscribe({
      next: (res: any) => {
        this.isResetLoading = false;
        this.resetSuccess = true;
        this.resetMessage = res.message || 'Password updated successfully!';
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