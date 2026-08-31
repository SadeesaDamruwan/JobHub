import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-applicants',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './manage-applicants.component.html',
  styleUrl: './manage-applicants.component.css'
})
export class ManageApplicantsComponent implements OnInit {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  
  companyName = 'Technova Solutions';
  applicants: any[] = [];
  selectedApplicant: any = null;
  isLoading = false;

  decisionNote = '';
  isEditingDecision = false;
  statusSuccessMessage = '';

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('companyName');
      if (stored) {
        this.companyName = stored;
      }
      this.fetchApplicants();
    } else {
      this.isLoading = false;
    }
  }

  fetchApplicants(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    const companyParam = encodeURIComponent((this.companyName || '').trim());
    this.http.get<any>(`http://localhost:3000/api/applications/employer-applicants?company=${companyParam}`).subscribe({
      next: (response) => {
        if (response && response.success && Array.isArray(response.applicants)) {
          this.applicants = response.applicants.map((app: any) => ({
            id: app.id,
            name: app.seekerName || `Candidate ${app.id}`, 
            initials: app.seekerName ? app.seekerName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'TS',
            roleApplied: app.jobTitle,
            appliedDate: app.appliedDate,
            status: app.status || 'New',
            employerFeedback: app.employerFeedback || '',
            email: app.seekerEmail,
            phone: app.phone || '+94 77 123 4567',
            location: app.location || 'Sri Lanka',
            experience: app.experience || 'Industry experience in modern software development.',
            education: app.education || 'BSc in Computer Science',
            coverLetter: app.coverLetter || `Dear Hiring Team,\n\nI am pleased to submit my application for the ${app.jobTitle} position at ${this.companyName}.\n\nThank you,\n${app.seekerName}`,
            resumeFileName: app.resumeFileName || 'Candidate_Resume.pdf',
            resumeData: app.resumeData || ''
          }));

          if (this.applicants.length > 0) {
            this.selectApplicant(this.applicants[0]);
          }
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching applicants:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectApplicant(applicant: any): void {
    this.selectedApplicant = applicant;
    this.decisionNote = applicant?.employerFeedback || '';
    this.isEditingDecision = false;
    this.statusSuccessMessage = '';
  }

  toggleEditDecision(): void {
    this.isEditingDecision = !this.isEditingDecision;
    this.cdr.detectChanges();
  }

  updateStatus(newStatus: string): void {
    if (!this.selectedApplicant) return;

    const appId = this.selectedApplicant.id;
    const payload = {
      status: newStatus,
      employerFeedback: (this.decisionNote || '').trim()
    };
    
    this.http.put<any>(`http://localhost:3000/api/applications/update-status/${appId}`, payload).subscribe({
      next: (response) => {
        if (response && response.success) {
          this.selectedApplicant.status = newStatus;
          this.selectedApplicant.employerFeedback = (this.decisionNote || '').trim();
          const index = this.applicants.findIndex(a => a.id === appId);
          if (index !== -1) {
            this.applicants[index].status = newStatus;
            this.applicants[index].employerFeedback = (this.decisionNote || '').trim();
          }
          this.isEditingDecision = false;
          this.statusSuccessMessage = `Decision (${newStatus}) sent to candidate!`;
          setTimeout(() => {
            this.statusSuccessMessage = '';
            this.cdr.detectChanges();
          }, 4000);
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error updating status:', err);
        alert('Failed to update candidate status.');
      }
    });
  }

  downloadResume(applicant: any): void {
    if (!applicant || !isPlatformBrowser(this.platformId)) return;

    if (applicant.resumeData && applicant.resumeData.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = applicant.resumeData;
      link.download = applicant.resumeFileName || `${applicant.name.replace(/\s+/g, '_')}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const content = `CANDIDATE APPLICATION PROFILE\n----------------------------\nName: ${applicant.name}\nEmail: ${applicant.email}\nPhone: ${applicant.phone}\nRole Applied: ${applicant.roleApplied}\nCompany: ${this.companyName}\nApplied Date: ${applicant.appliedDate}\nStatus: ${applicant.status}\n\nEXPERIENCE:\n${applicant.experience}\n\nEDUCATION:\n${applicant.education}\n\nCOVER LETTER:\n${applicant.coverLetter}\n`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${applicant.name.replace(/\s+/g, '_')}_Profile.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  }
}