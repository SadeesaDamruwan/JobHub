import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-edit-job',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-job.component.html'
})
export class EditJobComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  jobId: number | null = null;
  jobTitle = '';
  category = 'Tech & Engineering';
  workMode = 'Hybrid';
  jobLevel = 'Mid Level';
  location = '';
  stipend = '';
  deadline = '';
  description = '';

  message = '';
  isSuccess = false;
  isLoading = false;

  categories = ['Tech & Engineering', 'Marketing', 'Design', 'Finance', 'Business Ops'];
  workModes = ['Onsite', 'Hybrid', 'Remote'];
  jobLevels = ['Internship', 'Entry Level', 'Mid Level', 'Senior Level', 'Director / Executive'];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.jobId = parseInt(id, 10);
        this.loadJobDetails(this.jobId);
      } else {
        this.router.navigate(['/company/settings']);
      }
    });
  }

  loadJobDetails(id: number): void {
    this.isLoading = true;
    this.http.get<any>(`http://localhost:3000/api/jobs/single/${id}`).subscribe({
      next: (res) => {
        if (res && res.success && res.job) {
          const j = res.job;
          this.jobTitle = j.title || '';
          this.category = j.category || 'Tech & Engineering';
          this.workMode = j.workMode || j.type || 'Hybrid';
          this.jobLevel = j.level || 'Mid Level';
          this.location = j.location || '';
          this.stipend = j.salary || j.stipend || '';
          this.deadline = j.deadline || '';
          this.description = j.description || '';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading job details', err);
        this.isLoading = false;
        this.message = 'Failed to load job details.';
      }
    });
  }

  updateJob(): void {
    if (!this.jobTitle || !this.location || !this.description) {
      this.isSuccess = false;
      this.message = 'Please fill out all required fields.';
      return;
    }

    if (!this.jobId) {
      this.isSuccess = false;
      this.message = 'Missing job identifier.';
      return;
    }

    this.isLoading = true;
    const payload = {
      title: this.jobTitle,
      category: this.category,
      workMode: this.workMode,
      type: this.workMode,
      level: this.jobLevel,
      location: this.location,
      salary: this.stipend,
      stipend: this.stipend,
      deadline: this.deadline,
      description: this.description
    };

    this.http.put<any>(`http://localhost:3000/api/jobs/${this.jobId}`, payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.isSuccess = true;
        this.message = 'Job updated successfully! Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/company/settings']);
        }, 1200);
      },
      error: (err) => {
        console.error('Failed to update job', err);
        this.isLoading = false;
        this.isSuccess = false;
        this.message = 'Failed to save changes. Please try again.';
      }
    });
  }
}