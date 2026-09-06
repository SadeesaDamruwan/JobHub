import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-seeker-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  
  showPassword = false;
  showConfirmPassword = false;
  message = '';
  success = false;
  isLoading = false;

  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  register() {
    if (!this.fullName || !this.email || !this.password || !this.confirmPassword) {
      this.success = false;
      this.message = 'Please fill in all required fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.success = false;
      this.message = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;
    this.message = '';

    const seekerData = {
      fullName: this.fullName,
      email: this.email,
      password: this.password
    };

    this.http.post('http://localhost:3000/api/seeker/register', seekerData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.success = true;
        this.message = 'Account created successfully! Taking you to complete your profile...';
        
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('isSeekerLoggedIn', 'true');
          localStorage.setItem('seekerName', this.fullName);
          localStorage.setItem('seekerEmail', this.email);
        }
        
        setTimeout(() => {
          this.router.navigate(['/job-seeker/complete-profile']);
        }, 1000); 
      },
      error: (err) => {
        this.isLoading = false;
        this.success = false;
        this.message = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}