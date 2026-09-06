import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-edit-company-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-company-profile.component.html'
})
export class EditCompanyProfileComponent implements OnInit {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  
  // Company Details
  companyName = '';
  email = '';
  website = '';
  location = '';
  industry = 'Information Technology';
  description = '';
  
  logoPreview: string | ArrayBuffer | null = null;
  message = '';
  isSuccess = false;
  isLoading = false;

  industries = [
    'Information Technology',
    'Finance & Banking',
    'Design & Advertising',
    'Manufacturing',
    'Healthcare',
    'Education'
  ];

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const savedName = localStorage.getItem('companyName') || '';
    const savedEmail = localStorage.getItem('companyEmail') || '';

    this.companyName = savedName;
    this.email = savedEmail;

    const query = savedEmail ? `?email=${encodeURIComponent(savedEmail)}` : (savedName ? `?companyName=${encodeURIComponent(savedName)}` : '');
    
    if (query) {
      this.http.get<any>(`http://localhost:3000/api/company-details/profile${query}`).subscribe({
        next: (res) => {
          if (res && res.success && res.profile) {
            this.companyName = res.profile.companyName || this.companyName;
            this.email = res.profile.email || this.email;
            this.website = res.profile.website || '';
            this.location = res.profile.location || '';
            this.industry = res.profile.industry || 'Information Technology';
            this.description = res.profile.description || '';
            if (res.profile.logo) {
              this.logoPreview = res.profile.logo;
            }
            this.cdr.detectChanges();
          }
        },
        error: () => {}
      });
    }
  }

  onLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => this.logoPreview = e.target?.result || null;
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    if (!this.companyName || !this.email) {
      this.isSuccess = false;
      this.message = 'Company Name and Email are required.';
      return;
    }

    this.isLoading = true;
    const payload = {
      companyName: this.companyName,
      email: this.email,
      website: this.website,
      location: this.location,
      industry: this.industry,
      description: this.description,
      logo: this.logoPreview || ''
    };

    this.http.put<any>('http://localhost:3000/api/company-details/profile', payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.isSuccess = true;
        this.message = 'Company profile saved successfully!';

        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('companyName', this.companyName);
          localStorage.setItem('companyEmail', this.email);
          localStorage.setItem('isCompanyLoggedIn', 'true');
        }

        setTimeout(() => {
          this.message = '';
        }, 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.isSuccess = false;
        this.message = 'Failed to save company profile. Please try again.';
        console.error('Error saving company profile:', err);
      }
    });
  }
}