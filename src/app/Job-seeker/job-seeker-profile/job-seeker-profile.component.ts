import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-job-seeker-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './job-seeker-profile.component.html',
  styleUrl: './job-seeker-profile.component.css'
})
export class JobSeekerProfileComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  profileData: any = null;
  skillsArray: string[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  resumeFileName: string = '';
  resumeData: string = '';

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const email = localStorage.getItem('seekerEmail');
      
      if (email) {
        this.resumeFileName = localStorage.getItem(`seekerResumeName_${email}`) || '';
        this.resumeData = localStorage.getItem(`seekerResumeData_${email}`) || '';
        this.fetchProfileData(email);
      } else {
        this.errorMessage = 'No user email found. Please log in or register.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }
  }

  fetchProfileData(email: string): void {
    this.http.get(`http://localhost:3000/api/seeker/profile/${encodeURIComponent(email)}`).subscribe({
      next: (response: any) => {
        this.profileData = response.profile;
        
        if (this.profileData.skills) {
          this.skillsArray = this.profileData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
        }

        if (this.profileData.resumeFileName && !this.resumeFileName) {
          this.resumeFileName = this.profileData.resumeFileName;
        }
        if (this.profileData.resumeData && !this.resumeData) {
          this.resumeData = this.profileData.resumeData;
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        this.errorMessage = 'Could not load profile data. Have you completed your profile setup yet?';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToEditProfile(): void {
    this.router.navigate(['/job-seeker/complete-profile']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  downloadCV(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.resumeData && this.resumeData.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = this.resumeData;
      link.download = this.resumeFileName || `${this.profileData?.fullName?.replace(/\s+/g, '_') || 'My'}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const name = this.profileData?.fullName || 'Candidate';
      const content = `CANDIDATE PROFILE & RESUME\n--------------------------\nFull Name: ${name}\nTitle: ${this.profileData?.jobTitle || 'Job Seeker'}\nEmail: ${this.profileData?.email}\nPhone: ${this.profileData?.phone || 'Not specified'}\nLocation: ${this.profileData?.location || 'Not specified'}\n\nSummary:\n${this.profileData?.bio || 'N/A'}\n\nSkills:\n${this.profileData?.skills || 'N/A'}\n`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name.replace(/\s+/g, '_')}_Resume.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  }
}