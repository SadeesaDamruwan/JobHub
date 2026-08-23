import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // <-- Added Router here

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './settings.component.html'
})
export class SettingsComponent {
  
  // Inject Router so we can navigate
  constructor(private router: Router) {}

  myJobs = [
    { id: 1, title: 'Senior Flutter Developer', type: 'Full-time', status: 'Active', posted: '2 days ago' },
    { id: 2, title: 'UI/UX Product Designer', type: 'Contract', status: 'Active', posted: '1 week ago' },
    { id: 3, title: 'Backend Node.js Engineer', type: 'Full-time', status: 'Active', posted: '2 weeks ago' },
    { id: 4, title: 'Marketing Manager', type: 'Full-time', status: 'Closed', posted: '1 month ago' }
  ];

  get totalJobsPosted(): number {
    return this.myJobs.length;
  }

  // ---> UPDATED: Now navigates to the Edit Job page <---
  editJob(jobId: number) {
    this.router.navigate(['/company/edit-job']);
  }
}