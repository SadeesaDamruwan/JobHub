import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-job-seeker-jobs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './job-seeker-jobs.html', // Make sure this matches your HTML file name!
  styleUrl: './job-seeker-jobs.css'
})
export class JobSeekerJobsComponent {
  
  // State for the currently selected filter
  selectedFilter = signal('All');

  // Mock Database of Applications
  applications = signal([
    { id: 1, avatarBg: '#e6ecfd', avatarText: 'ZA', title: 'Software Engineer', company: 'Zenith Analytics', location: 'Colombo 03', appliedDate: 'Aug 20, 2026', status: 'Under Review' },
    { id: 2, avatarBg: '#fde3ec', avatarText: 'MS', title: 'Product Designer', company: 'Meridian Studio', location: 'Rajagiriya', appliedDate: 'Aug 18, 2026', status: 'Interview' },
    { id: 3, avatarBg: '#e0f5e6', avatarText: 'LF', title: 'Finance Associate', company: 'Lotus Fintech', location: 'Colombo 01', appliedDate: 'Aug 15, 2026', status: 'Offer' },
    { id: 4, avatarBg: '#ede4fd', avatarText: 'VB', title: 'Operations Associate', company: 'Vantage BPO', location: 'Kandy', appliedDate: 'Aug 21, 2026', status: 'Applied' },
    { id: 5, avatarBg: '#fdead9', avatarText: 'SM', title: 'Marketing Executive', company: 'Solstice Media', location: 'Remote', appliedDate: 'Aug 10, 2026', status: 'Rejected' },
  ]);

  // Computed metrics for the top cards
  appliedCount = computed(() => this.applications().filter(a => a.status === 'Applied').length);
  underReviewCount = computed(() => this.applications().filter(a => a.status === 'Under Review').length);
  interviewCount = computed(() => this.applications().filter(a => a.status === 'Interview').length);
  offerCount = computed(() => this.applications().filter(a => a.status === 'Offer').length);

  // Computed list that automatically filters based on the selected button
  filteredApplications = computed(() => {
    if (this.selectedFilter() === 'All') return this.applications();
    return this.applications().filter(a => a.status === this.selectedFilter());
  });

  // Action to change the filter
  setFilter(filter: string) {
    this.selectedFilter.set(filter);
  }

  // Dynamic CSS classes for badges
  getStatusClass(status: string): string {
    switch(status) {
      case 'Applied': return 'status-applied';
      case 'Under Review': return 'status-review';
      case 'Interview': return 'status-interview';
      case 'Offer': return 'status-offer';
      case 'Rejected': return 'status-rejected';
      default: return 'status-applied';
    }
  }
}