import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-edit-company-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-company-profile.component.html'
})
export class EditCompanyProfileComponent {
  
  // Company Details
  companyName = 'Technova Solutions';
  email = 'contact@technovasolutions.lk';
  website = 'https://technovasolutions.lk';
  location = 'Colombo 03, Sri Lanka';
  industry = 'Information Technology';
  description = 'We are a leading tech company specializing in web development, mobile apps, and enterprise solutions.';
  
  logoPreview: string | ArrayBuffer | null = null;
  message = '';
  isSuccess = false;

  industries = [
    'Information Technology',
    'Finance & Banking',
    'Design & Advertising',
    'Manufacturing',
    'Healthcare',
    'Education'
  ];

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

    // Mock API Save
    console.log('Saving company profile:', {
      name: this.companyName,
      email: this.email,
      website: this.website,
      location: this.location,
      industry: this.industry,
      description: this.description
    });

    this.isSuccess = true;
    this.message = 'Company details updated successfully!';
    
    // Hide message after 3 seconds
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }
}