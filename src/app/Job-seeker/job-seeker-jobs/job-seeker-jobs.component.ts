import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-job-seeker-jobs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './job-seeker-jobs.html',
  styleUrl: './job-seeker-jobs.css'
})
export class JobSeekerJobsComponent implements OnInit {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  applications: any[] = [];
  isLoading: boolean = false;
  currentFilter: string = 'All';
  selectedAppForModal: any = null;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.fetchApplications();
    } else {
      this.isLoading = false;
    }
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
}