import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // <-- 1. Brought this back

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registration.component.html' 
})
export class RegistrationComponent {
  // Form fields
  companyName = '';
  email = '';
  password = '';
  confirmPassword = '';
  rememberMe = false;
  
  // UI States
  showPassword = false;
  showConfirmPassword = false;
  logoPreview: string | ArrayBuffer | null = null;
  message = '';
  success = false;

  constructor(private router: Router) {}
  private http = inject(HttpClient); // <-- 2. Injected the HTTP client

  onLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => this.logoPreview = e.target?.result || null;
      reader.readAsDataURL(file);
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  createAccount() {
    // Basic validation
    if (!this.companyName || !this.email || !this.password || !this.confirmPassword) {
      this.success = false;
      this.message = 'Please fill in all required fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.success = false;
      this.message = 'Passwords do not match.';
      return;
    }

    // 3. Send the data to your Node.js Express backend
    const companyData = {
      companyName: this.companyName,
      email: this.email,
      password: this.password
    };

    this.http.post('http://localhost:3000/api/company/register', companyData).subscribe({
      next: (response: any) => {
        // Success logic
        this.success = true;
        this.message = 'Account created! Redirecting to post a job...';
        
        console.log('New Company Registered:', { name: this.companyName, email: this.email });

        localStorage.setItem('isCompanyLoggedIn', 'true');
        localStorage.setItem('companyName', this.companyName);
        localStorage.setItem('companyEmail', this.email);
        
        // Redirect directly to the Post Job page
        setTimeout(() => {
          this.router.navigate(['/company/post-job']);
        }, 1500);
      },
      error: (err) => {
        // If the backend says the email exists, show it here
        this.success = false;
        this.message = err.error.message || 'Registration failed. Please try again.';
      }
    });
  }
}