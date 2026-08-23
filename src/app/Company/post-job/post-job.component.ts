import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router'; // Added ActivatedRoute

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
  stipend = '';
  deadline = '';
  description = '';

  // UI States
  message = '';
  isSuccess = false;
  returnUrl = '/'; // Defaults to Home

  // Dropdown Options
  categories = ['Tech & Engineering', 'Marketing', 'Design', 'Finance', 'Business Ops'];
  workModes = ['Onsite', 'Hybrid', 'Remote'];
  jobLevels = ['Internship', 'Entry Level', 'Mid Level', 'Senior Level', 'Director / Executive'];

  constructor(private router: Router, private route: ActivatedRoute) {}

  // Check the URL to see where we came from when the page loads
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });
  }

  // Dynamic Cancel Navigation
  cancel() {
    this.router.navigateByUrl(this.returnUrl);
  }

  submitJob() {
    // Basic Validation
    if (!this.jobTitle || !this.location || !this.description) {
      this.isSuccess = false;
      this.message = 'Please fill out all required fields.';
      return;
    }

    // Success State
    this.isSuccess = true;
    this.message = 'Job posted successfully! Redirecting...';

    // Redirect dynamically after saving
    setTimeout(() => {
      this.router.navigateByUrl(this.returnUrl);
    }, 1500);
  }
}