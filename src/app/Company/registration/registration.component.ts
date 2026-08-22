import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

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

    // Success logic
    this.success = true;
    this.message = 'Account created! Redirecting to post a job...';
    
    console.log('New Company Registered:', { name: this.companyName, email: this.email });

    // Set company as logged in
    localStorage.setItem('isCompanyLoggedIn', 'true');
    
    // ---> CHANGED: Now redirects directly to the Post Job page! <---
    setTimeout(() => {
      this.router.navigate(['/company/post-job']);
    }, 1500);
  }
}