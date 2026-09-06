import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  companyName = '';
  myJobs: any[] = [];
  isLoading = false;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('companyName');
      if (stored) {
        this.companyName = stored;
      }
      this.fetchCompanyJobs();
    } else {
      this.isLoading = false;
    }
  }

  fetchCompanyJobs(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading = false;
      return;
    }

    if (!this.companyName) {
      this.myJobs = [];
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    const targetCompany = (this.companyName || '').trim().toLowerCase();

    this.http.get<any>('http://localhost:3000/api/jobs/all').subscribe({
      next: (res) => {
        if (res && res.success && Array.isArray(res.jobs)) {
          const matchingJobs = res.jobs.filter((job: any) => 
            (job.company || '').trim().toLowerCase() === targetCompany
          );

          this.myJobs = matchingJobs.map((job: any) => ({
            id: job.id,
            title: job.title,
            type: job.type || job.workMode || 'Full-time',
            status: job.status || 'Active',
            location: job.location,
            salary: job.salary || job.stipend,
            posted: this.formatDate(job.postedAt)
          }));
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch company jobs', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  get totalJobsPosted(): number {
    return this.myJobs.length;
  }

  editJob(jobId: number) {
    this.router.navigate(['/company/edit-job'], { queryParams: { id: jobId } });
  }

  deleteJob(jobId: number) {
    if (confirm('Are you sure you want to delete this job listing?')) {
      this.http.delete<any>(`http://localhost:3000/api/jobs/${jobId}`).subscribe({
        next: () => {
          this.myJobs = this.myJobs.filter(j => j.id !== jobId);
        },
        error: (err) => {
          console.error('Failed to delete job', err);
        }
      });
    }
  }
}