import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Job {
  initials: string;
  avatarColor: string;
  title: string;
  company: string;
  location: string;
  level: string; 
  workMode: string;
  stipend: string;
  categoryTag: string;
  tagColor: string;
  tagBg: string;
  barColor: string;
  daysLeft: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  isCompanyLoggedIn = false;
  isDropdownOpen = false;

  isSeekerLoggedIn = false;
  isSeekerDropdownOpen = false;

  isJobDropdownOpen = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.isCompanyLoggedIn = localStorage.getItem('isCompanyLoggedIn') === 'true';
      this.isSeekerLoggedIn = localStorage.getItem('isSeekerLoggedIn') === 'true';
    }
  }

  // ---- Main Navbar Menus ----
  toggleJobMenu() {
    this.isJobDropdownOpen = !this.isJobDropdownOpen;
    this.isDropdownOpen = false;
    this.isSeekerDropdownOpen = false;
  }

  filterJobs(type: string) {
    this.isJobDropdownOpen = false;
    console.log('Filtering jobs by:', type);
  }

  viewActiveCompanies() {
    this.isJobDropdownOpen = false;
    this.isDropdownOpen = false;
    this.isSeekerDropdownOpen = false;
    console.log('Fetching and displaying only companies with active job postings...');
  }

  // ---- Company Navigation & Dropdown ----
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    this.isSeekerDropdownOpen = false; 
    this.isJobDropdownOpen = false;
  }

  startCompanyFlow() {
    this.router.navigate(['/company/login']);
  }

  // UPDATED: Navigates with queryParams to track origin
  goToPostJob() {
    this.isDropdownOpen = false;
    this.router.navigate(['/company/post-job'], { queryParams: { returnUrl: '/' } });
  }

  goToEditCompanyProfile() {
    this.isDropdownOpen = false;
    this.router.navigate(['/company/profile']);
  }

  goToEditPost() {
    this.isDropdownOpen = false;
    this.router.navigate(['/company/settings']); 
  }

  goToPostStatus() {
    this.isDropdownOpen = false;
    this.router.navigate(['/company/applicants']); 
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('isCompanyLoggedIn');
    }
    this.isCompanyLoggedIn = false;
    this.isDropdownOpen = false;
  }

  // ---- Job Seeker Navigation & Dropdown ----
  toggleSeekerDropdown() {
    this.isSeekerDropdownOpen = !this.isSeekerDropdownOpen;
    this.isDropdownOpen = false; 
    this.isJobDropdownOpen = false;
  }

  startSeekerFlow() {
    this.router.navigate(['/job-seeker/login']);
  }

  goToSeekerProfile() {
    this.isSeekerDropdownOpen = false;
    this.router.navigate(['/job-seeker/profile']);
  }

  goToSeekerJobs() {
    this.isSeekerDropdownOpen = false;
    this.router.navigate(['/job-seeker/jobs']);
  }

  logoutSeeker() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('isSeekerLoggedIn');
    }
    this.isSeekerLoggedIn = false;
    this.isSeekerDropdownOpen = false;
  }

  // ---- Page Data (Mock Data) ----
  activeListings = 1240;
  hiringCompanies = 386;
  offerRate = 72;
  
  searchKeyword = '';
  searchLocation = '';

  categories = [
    { name: 'Tech & Engineering', count: 412, color: '#2563eb', checked: true },
    { name: 'Marketing', count: 198, color: '#f59e0b', checked: false },
    { name: 'Design', count: 126, color: '#ec4899', checked: false },
    { name: 'Finance', count: 154, color: '#16a34a', checked: false },
    { name: 'Business Ops', count: 160, color: '#7c3aed', checked: false },
  ];

  workModes = ['Onsite', 'Hybrid', 'Remote'];
  selectedWorkMode = 'Onsite';

  jobLevels = [
    { label: 'Internship', checked: false },
    { label: 'Entry Level', checked: true },
    { label: 'Mid Level', checked: false },
    { label: 'Senior Level', checked: false },
    { label: 'Director / Executive', checked: false }
  ];

  minStipend = 0;
  maxStipend = 25000;
  sortBy = 'Deadline: soonest';

  jobs: Job[] = [
    { initials: 'ZA', avatarColor: '#1e3a8a', title: 'Software Engineer', company: 'Zenith Analytics · Colombo 03', location: 'Colombo 03', level: 'Mid Level', workMode: 'Hybrid', stipend: 'Rs 45,000 / mo', categoryTag: 'TECH', tagColor: '#2563eb', tagBg: '#e6ecfd', barColor: '#2563eb', daysLeft: 2 },
    { initials: 'MS', avatarColor: '#be123c', title: 'Product Designer', company: 'Meridian Studio · Rajagiriya', location: 'Rajagiriya', level: 'Mid Level', workMode: 'Onsite', stipend: 'Rs 38,000 / mo', categoryTag: 'DESIGN', tagColor: '#be185d', tagBg: '#fde3ec', barColor: '#e11d48', daysLeft: 6 },
    { initials: 'LF', avatarColor: '#15803d', title: 'Finance & Investment Associate', company: 'Lotus Fintech · Colombo 01', location: 'Colombo 01', level: 'Entry Level', workMode: 'Onsite', stipend: 'Rs 30,000 / mo', categoryTag: 'FINANCE', tagColor: '#15803d', tagBg: '#e0f5e6', barColor: '#16a34a', daysLeft: 18 },
    { initials: 'SM', avatarColor: '#c2410c', title: 'Digital Marketing Executive', company: 'Solstice Media · Remote', location: 'Remote', level: 'Entry Level', workMode: 'Remote', stipend: 'Rs 25,000 / mo', categoryTag: 'MARKETING', tagColor: '#c2410c', tagBg: '#fdead9', barColor: '#f59e0b', daysLeft: 11 },
    { initials: 'VB', avatarColor: '#6d28d9', title: 'Business Operations Associate', company: 'Vantage BPO · Kandy', location: 'Kandy', level: 'Internship', workMode: 'Onsite', stipend: 'Rs 28,000 / mo', categoryTag: 'BUSINESS', tagColor: '#6d28d9', tagBg: '#ede4fd', barColor: '#7c3aed', daysLeft: 4 }
  ];

  get filteredJobsCount(): number {
    return this.jobs.length;
  }

  selectWorkMode(mode: string) {
    this.selectedWorkMode = mode;
  }

  onSearch() {
    console.log('Searching for', this.searchKeyword, 'in', this.searchLocation);
  }
}