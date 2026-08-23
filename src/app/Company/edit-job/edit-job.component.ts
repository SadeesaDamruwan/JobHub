import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-edit-job',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-job.component.html' // <-- Ensure this matches your HTML file name!
})
export class EditJobComponent {
  // Pre-filled Form Fields for editing
  jobTitle = 'Senior Flutter Developer';
  category = 'Tech & Engineering';
  workMode = 'Hybrid';
  jobLevel = 'Mid Level';
  location = 'Colombo 03';
  stipend = 'Rs 85,000 / mo';
  deadline = '2026-09-30';
  description = 'We are looking for an experienced developer to join Technova Solutions. You will be building scalable mobile and web applications using Flutter, React, and Node.js.';

  // UI States
  message = '';
  isSuccess = false;

  // Dropdown Options
  categories = ['Tech & Engineering', 'Marketing', 'Design', 'Finance', 'Business Ops'];
  workModes = ['Onsite', 'Hybrid', 'Remote'];
  jobLevels = ['Internship', 'Entry Level', 'Mid Level', 'Senior Level', 'Director / Executive'];

  constructor(private router: Router) {}

  updateJob() {
    // Basic Validation
    if (!this.jobTitle || !this.location || !this.description) {
      this.isSuccess = false;
      this.message = 'Please fill out all required fields.';
      return;
    }

    // Success State
    this.isSuccess = true;
    this.message = 'Job updated successfully! Redirecting...';

    // Redirect back to the dashboard after saving
    setTimeout(() => {
      this.router.navigate(['/company/settings']);
    }, 1500);
  }
}