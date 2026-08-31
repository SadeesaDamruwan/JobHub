import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-post-job',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './post-job.component.html'
})
export class PostJobComponent implements OnInit {
  // Form Fields
  jobTitle = '';
  category = 'Tech & Engineering';
  workMode = 'Onsite';
  jobLevel = 'Entry Level';
  location = '';
  stipendRaw = '';
  selectedCurrency = 'LKR';
  stipendAmount = '';
  deadline = '';
  minDeadlineDate = new Date().toISOString().split('T')[0];
  description = '';

  // UI States
  message = '';
  isSuccess = false;
  returnUrl = '/';

  // Dropdown Options
  categories = ['Tech & Engineering', 'Marketing', 'Design', 'Finance', 'Business Ops'];
  workModes = ['Onsite', 'Hybrid', 'Remote'];
  jobLevels = ['Internship', 'Entry Level', 'Mid Level', 'Senior Level', 'Director / Executive'];

  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/';
    });
  }

  cancel() {
    this.router.navigateByUrl(this.returnUrl);
  }

  setQuickDeadline(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    this.deadline = d.toISOString().split('T')[0];
  }

  clearDeadline() {
    this.deadline = '';
  }

  submitJob() {
    // 1. Basic validation
    if (!this.jobTitle || !this.location || !this.description) {
      this.isSuccess = false;
      this.message = 'Please fill out all required fields (*).';
      return;
    }

    // 2. Format the stipend with the selected currency
    let finalStipend = 'Negotiable';
    if (this.stipendAmount && this.stipendAmount.trim()) {
      const prefix = this.selectedCurrency === 'USD' ? '$' : 'Rs ';
      finalStipend = `${prefix}${this.stipendAmount.trim()} / mo`;
    } else if (this.stipendRaw && this.stipendRaw.trim()) {
      finalStipend = this.stipendRaw.trim();
    }

    const savedCompanyName = typeof localStorage !== 'undefined' ? localStorage.getItem('companyName') : null;

    const newJobData = {
      title: this.jobTitle,
      company: savedCompanyName || 'Technova Solutions',
      category: this.category,
      level: this.jobLevel,
      workMode: this.workMode,
      location: this.location,
      stipend: finalStipend,
      deadline: this.deadline,
      description: this.description
    };

    // 4. Send POST request
    this.http.post('http://localhost:3000/api/jobs', newJobData).subscribe({
      next: (response: any) => {
        this.isSuccess = true;
        this.message = 'Job posted successfully! Redirecting...';
        
        // Redirect using the dynamically captured returnUrl
        setTimeout(() => {
          this.router.navigateByUrl(this.returnUrl);
        }, 1500);
      },
      error: (err) => {
        this.isSuccess = false;
        this.message = 'Failed to post the job. Please try again.';
        console.error('Error posting job:', err);
      }
    });
  }
}