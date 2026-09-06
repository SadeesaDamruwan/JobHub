import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-job-seeker-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './job-seeker-jobs.html',
  styleUrl: './job-seeker-jobs.css'
})
export class JobSeekerJobsComponent implements OnInit {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Main Dashboard Navigation Tab
  activeMainTab: 'applications' | 'saved-jobs' = 'applications';

  // Applications Data
  applications: any[] = [];
  isLoading: boolean = false;
  currentFilter: string = 'All';
  selectedAppForModal: any = null;

  // Saved Jobs Data
  savedJobs: any[] = [];
  savedJobIds: any[] = [];
  isLoadingSavedJobs: boolean = false;

  // Apply Modal & Custom Cover Letter State
  isApplyModalOpen = false;
  applyingJob: any = null;
  candidateProfile: any = null;
  customCoverLetter = '';
  isSubmittingApplication = false;
  applySuccessMessage = '';

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.router.url.includes('saved-jobs')) {
        this.activeMainTab = 'saved-jobs';
      }
      this.fetchApplications();
      this.fetchSavedJobs();
    } else {
      this.isLoading = false;
    }
  }

  setMainTab(tab: 'applications' | 'saved-jobs'): void {
    this.activeMainTab = tab;
    if (tab === 'saved-jobs' && this.savedJobs.length === 0) {
      this.fetchSavedJobs();
    }
    this.cdr.detectChanges();
  }

  fetchApplications(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    let url = 'http://localhost:3000/api/applications/my-applications';
    const email = localStorage.getItem('seekerEmail');
    if (email) {
      url += `?email=${encodeURIComponent(email)}`;
    }

    this.http.get(url).subscribe({
      next: (response: any) => {
        if (response && response.success && Array.isArray(response.applications)) {
          this.applications = response.applications;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch applications:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  fetchSavedJobs(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const email = localStorage.getItem('seekerEmail') || 'guest';
    this.isLoadingSavedJobs = true;
    this.cdr.detectChanges();

    try {
      const raw = localStorage.getItem(`savedJobs_${email}`);
      this.savedJobIds = raw ? JSON.parse(raw) : [];
    } catch {
      this.savedJobIds = [];
    }

    this.http.get<any>(`http://localhost:3000/api/seeker/saved-jobs-details/${encodeURIComponent(email)}`).subscribe({
      next: (res) => {
        if (res && res.success && Array.isArray(res.jobs)) {
          this.savedJobs = res.jobs;
          this.savedJobIds = res.savedJobIds || [];
          try {
            localStorage.setItem(`savedJobs_${email}`, JSON.stringify(this.savedJobIds));
          } catch (e) {}
        } else {
          this.fallbackFetchAllJobs();
        }
        this.isLoadingSavedJobs = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.fallbackFetchAllJobs();
      }
    });
  }

  private fallbackFetchAllJobs(): void {
    const email = localStorage.getItem('seekerEmail') || 'guest';
    this.http.get<any>('http://localhost:3000/api/jobs/all').subscribe({
      next: (res) => {
        if (res && res.success && Array.isArray(res.jobs)) {
          this.savedJobs = res.jobs.filter((j: any) => {
            const targetId = String(j.id || j._id || '');
            return this.savedJobIds.some(id => String(id) === targetId);
          });
        }
        this.isLoadingSavedJobs = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingSavedJobs = false;
        this.cdr.detectChanges();
      }
    });
  }

  removeSavedJob(job: any): void {
    if (!isPlatformBrowser(this.platformId) || !job) return;

    const email = localStorage.getItem('seekerEmail') || 'guest';
    const targetId = String(job.id || job._id || '');

    this.savedJobs = this.savedJobs.filter((j) => String(j.id || j._id) !== targetId);
    this.savedJobIds = this.savedJobIds.filter((id) => String(id) !== targetId);

    try {
      localStorage.setItem(`savedJobs_${email}`, JSON.stringify(this.savedJobIds));
    } catch (e) {
      console.warn('Failed to update local saved jobs:', e);
    }
    this.cdr.detectChanges();

    if (email !== 'guest') {
      this.http.delete<any>(`http://localhost:3000/api/seeker/saved-jobs/${encodeURIComponent(email)}/${targetId}`).subscribe({
        error: (err) => console.warn('Saved job removal sync error:', err)
      });
    }
  }

  applyForSavedJob(job: any): void {
    this.openApplyModal(job);
  }

  openApplyModal(job: any): void {
    let seekerEmail = '';
    let seekerName = '';
    if (isPlatformBrowser(this.platformId)) {
      seekerEmail = localStorage.getItem('seekerEmail') || '';
      seekerName = localStorage.getItem('seekerName') || '';
    }

    if (!seekerEmail) {
      alert('Please complete your profile to apply.');
      this.router.navigate(['/job-seeker/complete-profile']);
      return;
    }

    this.applyingJob = job;
    this.applySuccessMessage = '';
    this.isSubmittingApplication = false;

    this.http.get<any>(`http://localhost:3000/api/seeker/profile/${encodeURIComponent(seekerEmail)}`).subscribe({
      next: (profileRes) => {
        const p = profileRes?.profile || {};
        this.candidateProfile = {
          fullName: seekerName || p.fullName || 'Job Seeker',
          email: seekerEmail,
          phone: p.phone || '',
          location: p.location || '',
          bio: p.bio || '',
          jobTitle: p.jobTitle || '',
          skills: p.skills || '',
          resumeFileName: p.resumeFileName || (isPlatformBrowser(this.platformId) ? (localStorage.getItem(`seekerResumeName_${seekerEmail}`) || '') : ''),
          resumeData: p.resumeData || (isPlatformBrowser(this.platformId) ? (localStorage.getItem(`seekerResumeData_${seekerEmail}`) || '') : '')
        };

        if (p.bio && p.bio.trim()) {
          this.customCoverLetter = `Dear Hiring Manager at ${job.company},\n\nI am writing to express my enthusiastic interest in the ${job.title} position.\n\n${p.bio.trim()}\n\nWith my background as a ${p.jobTitle || 'professional'}, I am confident that I can make an immediate positive contribution to your team.\n\nThank you for reviewing my application. I look forward to the opportunity to discuss my qualifications further.\n\nSincerely,\n${this.candidateProfile.fullName}`;
        } else {
          this.customCoverLetter = `Dear Hiring Manager at ${job.company},\n\nI am excited to submit my application for the ${job.title} role. My skills and enthusiasm make me a strong match for this opportunity.\n\nThank you for considering my application.\n\nSincerely,\n${this.candidateProfile.fullName}`;
        }

        this.isApplyModalOpen = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.candidateProfile = {
          fullName: seekerName || 'Job Seeker',
          email: seekerEmail,
          phone: '',
          location: '',
          bio: '',
          jobTitle: '',
          skills: '',
          resumeFileName: isPlatformBrowser(this.platformId) ? (localStorage.getItem(`seekerResumeName_${seekerEmail}`) || '') : '',
          resumeData: isPlatformBrowser(this.platformId) ? (localStorage.getItem(`seekerResumeData_${seekerEmail}`) || '') : ''
        };

        this.customCoverLetter = `Dear Hiring Manager at ${job.company},\n\nI am excited to apply for the ${job.title} position.\n\nSincerely,\n${this.candidateProfile.fullName}`;
        this.isApplyModalOpen = true;
        this.cdr.detectChanges();
      }
    });
  }

  closeApplyModal(): void {
    this.isApplyModalOpen = false;
    this.applyingJob = null;
    this.applySuccessMessage = '';
    this.cdr.detectChanges();
  }

  submitApplication(): void {
    if (!this.applyingJob || !this.candidateProfile) return;

    this.isSubmittingApplication = true;
    this.applySuccessMessage = '';
    this.cdr.detectChanges();

    const payload = {
      jobId: this.applyingJob.id || this.applyingJob._id,
      jobTitle: this.applyingJob.title,
      company: this.applyingJob.company,
      seekerName: this.candidateProfile.fullName,
      seekerEmail: this.candidateProfile.email,
      phone: this.candidateProfile.phone || '',
      location: this.candidateProfile.location || '',
      education: this.candidateProfile.bio || 'Degree / Professional Experience',
      experience: this.candidateProfile.jobTitle || 'Relevant industry experience',
      coverLetter: this.customCoverLetter ? this.customCoverLetter.trim() : `Application submitted for ${this.applyingJob.title} at ${this.applyingJob.company}.`,
      resumeFileName: this.candidateProfile.resumeFileName || '',
      resumeData: this.candidateProfile.resumeData || ''
    };

    this.http.post<any>('http://localhost:3000/api/applications/apply', payload).subscribe({
      next: (res) => {
        this.isSubmittingApplication = false;
        this.applySuccessMessage = res.message || 'Application submitted successfully with your custom cover letter!';
        this.fetchApplications();
        this.cdr.detectChanges();
        setTimeout(() => {
          this.closeApplyModal();
        }, 1600);
      },
      error: (err) => {
        this.isSubmittingApplication = false;
        alert(err.error?.message || 'Failed to submit application.');
        this.cdr.detectChanges();
      }
    });
  }

  openDetailsModal(app: any): void {
    this.selectedAppForModal = app;
    this.cdr.detectChanges();
  }

  closeDetailsModal(): void {
    this.selectedAppForModal = null;
    this.cdr.detectChanges();
  }

  // --- FILTER LOGIC ---
  selectedFilter(): string {
    return this.currentFilter;
  }

  setFilter(filterName: string): void {
    this.currentFilter = filterName;
  }

  filteredApplications(): any[] {
    if (this.currentFilter === 'All') {
      return this.applications;
    }
    if (this.currentFilter === 'Applied') {
      return this.applications.filter(app => app.status === 'Applied' || app.status === 'New');
    }
    if (this.currentFilter === 'Offer') {
      return this.applications.filter(app => app.status === 'Offer' || app.status === 'Accepted');
    }
    return this.applications.filter(app => app.status === this.currentFilter);
  }

  // --- STATS COUNTERS ---
  appliedCount(): number {
    return this.applications.filter(app => app.status === 'Applied' || app.status === 'New').length;
  }

  underReviewCount(): number {
    return this.applications.filter(app => app.status === 'Under Review').length;
  }

  interviewCount(): number {
    return this.applications.filter(app => app.status === 'Interview').length;
  }

  offerCount(): number {
    return this.applications.filter(app => app.status === 'Offer' || app.status === 'Accepted').length;
  }

  // --- UI HELPERS ---
  getStatusClass(status: string): string {
    switch (status) {
      case 'New':
      case 'Applied': return 'status-applied';
      case 'Under Review': return 'status-review';
      case 'Interview': return 'status-interview';
      case 'Accepted':
      case 'Offer': return 'status-offer';
      case 'Rejected': return 'status-rejected';
      default: return '';
    }
  }

  formatPostedDate(dateStr?: string): string {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Recently';

    const diffMs = Date.now() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return '1d ago';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getDaysLeftNumber(deadline?: string): string {
    if (!deadline) return '—';
    const target = new Date(deadline);
    if (isNaN(target.getTime())) return '—';
    const diff = Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return '0';
    return diff.toString();
  }

  getDaysLeftLabel(deadline?: string): string {
    if (!deadline) return 'No deadline';
    const target = new Date(deadline);
    if (isNaN(target.getTime())) return 'No deadline';
    const diff = Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Expired';
    if (diff === 0) return 'Ends today';
    if (diff === 1) return 'day left';
    return 'days left';
  }

  getDaysLeftColor(deadline?: string): string {
    if (!deadline) return '#6b7280';
    const target = new Date(deadline);
    if (isNaN(target.getTime())) return '#6b7280';
    const diff = Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff <= 2) return '#ef4444';
    if (diff <= 5) return '#f59e0b';
    return '#10b981';
  }
}