import { Component, OnInit, Inject, PLATFORM_ID, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);

  // Auth states
  isCompanyLoggedIn = false;
  isSeekerLoggedIn = false;
  companyName = 'Technova Solutions';
  seekerName = 'Job Seeker';
  
  // Dropdown UI toggles
  isDropdownOpen = false;
  isSeekerDropdownOpen = false;
  isJobDropdownOpen = false;

  companyFilterMode: 'my-company' | 'all-jobs' = 'my-company';

  // Jobs data
  jobs: any[] = [];
  allJobs: any[] = [];
  isLoading = false;

  // Filter States & Dropdown Options matching your HTML template
  searchKeyword = '';
  searchLocation = '';
  selectedCategory = ''; // Default to empty so it doesn't force restrict on start
  selectedWorkMode = '';
  sortBy = 'Deadline: soonest';
  
  minStipend = 0;
  maxStipend = 200000;

 // Structured categories matching your HTML template
  categories = [
    { name: 'Tech & Engineering', color: '#5046e5', checked: false, count: 0 },
    { name: 'Marketing', color: '#10b981', checked: false, count: 0 },
    { name: 'Design', color: '#f59e0b', checked: false, count: 0 },
    { name: 'Finance', color: '#ef4444', checked: false, count: 0 },
    { name: 'Business Ops', color: '#8b5cf6', checked: false, count: 0 }
  ];

  workModes = ['Onsite', 'Hybrid', 'Remote'];

  // Structured job levels matching your HTML template
  jobLevels = [
    { label: 'Internship', checked: false },
    { label: 'Entry Level', checked: false },
    { label: 'Mid Level', checked: false },
    { label: 'Senior Level', checked: false },
    { label: 'Director / Executive', checked: false }
  ];

  // Real Dynamic Dashboard Stats
  activeListings = 0;
  realHiringCompaniesCount = 0;
  activeCategoriesCount = 0;

  // Seeker Specific Real Stats
  myApplicationsCount = 0;
  myInterviewsCount = 0;

  // Company Specific Real Stats
  companyApplicantsCount = 0;
  companyInterviewsCount = 0;

  // Saved Jobs (Bookmarking)
  savedJobIds: number[] = [];

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.isCompanyLoggedIn = localStorage.getItem('isCompanyLoggedIn') === 'true';
      this.isSeekerLoggedIn = localStorage.getItem('isSeekerLoggedIn') === 'true';
      this.companyName = localStorage.getItem('companyName') || 'Technova Solutions';
      this.seekerName = localStorage.getItem('seekerName') || 'Job Seeker';
      this.loadSavedJobs();
      this.fetchProfileDashboardStats();
    }
    this.fetchFilteredJobs(true);
  }

  loadSavedJobs() {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const email = localStorage.getItem('seekerEmail') || 'guest';
      const raw = localStorage.getItem(`savedJobs_${email}`);
      this.savedJobIds = raw ? JSON.parse(raw) : [];
    } catch {
      this.savedJobIds = [];
    }
  }

  isJobSaved(job: any): boolean {
    return !!job && this.savedJobIds.includes(job.id);
  }

  toggleSaveJob(job: any) {
    if (!isPlatformBrowser(this.platformId) || !job) return;

    const email = localStorage.getItem('seekerEmail') || 'guest';
    const index = this.savedJobIds.indexOf(job.id);
    if (index === -1) {
      this.savedJobIds.push(job.id);
    } else {
      this.savedJobIds.splice(index, 1);
    }

    try {
      localStorage.setItem(`savedJobs_${email}`, JSON.stringify(this.savedJobIds));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
    this.cdr.detectChanges();
  }

  fetchProfileDashboardStats() {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.isCompanyLoggedIn && this.companyName) {
      this.http.get<any>(`http://localhost:3000/api/applications/employer-applicants?company=${encodeURIComponent(this.companyName)}`).subscribe({
        next: (res) => {
          if (res && res.success && Array.isArray(res.applicants)) {
            this.companyApplicantsCount = res.applicants.length;
            this.companyInterviewsCount = res.applicants.filter((a: any) => a.status === 'Interview' || a.status === 'Accepted').length;
            this.cdr.detectChanges();
          }
        },
        error: () => {}
      });
    }

    if (this.isSeekerLoggedIn) {
      const email = localStorage.getItem('seekerEmail');
      if (email) {
        this.http.get<any>(`http://localhost:3000/api/applications/my-applications?email=${encodeURIComponent(email)}`).subscribe({
          next: (res) => {
            if (res && res.success && Array.isArray(res.applications)) {
              this.myApplicationsCount = res.applications.length;
              this.myInterviewsCount = res.applications.filter((a: any) => a.status === 'Interview' || a.status === 'Accepted' || a.status === 'Offer').length;
              this.cdr.detectChanges();
            }
          },
          error: () => {}
        });
      }
    }
  }

  // Fetch jobs dynamically based on selected filters
  fetchFilteredJobs(forceReload = false) {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading = false;
      return;
    }

    if (this.allJobs.length > 0 && !forceReload) {
      this.isLoading = false;
      this.applyFilters();
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.http.get<any>('http://localhost:3000/api/jobs/all').subscribe({
      next: (data) => {
        if (data && data.success && Array.isArray(data.jobs)) {
          this.allJobs = data.jobs;
          this.activeListings = this.allJobs.length;
          const companiesSet = new Set(this.allJobs.map(j => (j.company || '').trim()).filter(Boolean));
          this.realHiringCompaniesCount = companiesSet.size;
          const categoriesSet = new Set(this.allJobs.map(j => (j.category || '').trim()).filter(Boolean));
          this.activeCategoriesCount = categoriesSet.size || this.categories.length;
          this.updateCategoryCounts();
          this.applyFilters();
        } else {
          this.allJobs = [];
          this.jobs = [];
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to filter jobs', err);
        this.isLoading = false;
        this.applyFilters();
        this.cdr.detectChanges();
      }
    });
  }

  updateCategoryCounts() {
    this.categories.forEach(cat => {
      cat.count = this.allJobs.filter(j => 
        j.category && j.category.toLowerCase().includes(cat.name.toLowerCase())
      ).length;
    });
  }

  applyFilters() {
    let result = [...this.allJobs];

    if (this.searchKeyword && this.searchKeyword.trim() !== '') {
      const q = this.searchKeyword.trim().toLowerCase();
      result = result.filter(job => 
        (job.title && job.title.toLowerCase().includes(q)) ||
        (job.company && job.company.toLowerCase().includes(q)) ||
        (job.description && job.description.toLowerCase().includes(q))
      );
    }

    if (this.searchLocation && this.searchLocation.trim() !== '' && this.searchLocation !== 'All locations') {
      const loc = this.searchLocation.trim().toLowerCase();
      result = result.filter(job => 
        job.location && job.location.toLowerCase().includes(loc)
      );
    }

    const checkedCats = this.categories.filter(c => c.checked).map(c => c.name.toLowerCase());
    if (checkedCats.length > 0) {
      result = result.filter(job => 
        job.category && checkedCats.some(catName => job.category.toLowerCase().includes(catName))
      );
    } else if (this.selectedCategory) {
      const sel = this.selectedCategory.toLowerCase();
      result = result.filter(job => 
        job.category && job.category.toLowerCase().includes(sel)
      );
    }

    if (this.selectedWorkMode) {
      const mode = this.selectedWorkMode.toLowerCase();
      result = result.filter(job => 
        (job.workMode && job.workMode.toLowerCase() === mode) ||
        (job.type && job.type.toLowerCase() === mode)
      );
    }

    const checkedLevels = this.jobLevels.filter(l => l.checked).map(l => l.label.toLowerCase());
    if (checkedLevels.length > 0) {
      result = result.filter(job => 
        job.level && checkedLevels.some(lvl => job.level.toLowerCase().includes(lvl))
      );
    }

    if (this.minStipend > 0) {
      result = result.filter(job => {
        const stipendVal = this.extractNumericStipend(job.stipend || job.salary);
        return stipendVal >= this.minStipend;
      });
    }

    if (this.isCompanyLoggedIn && this.companyFilterMode === 'my-company') {
      result = result.filter(job => 
        job.company && job.company.toLowerCase().trim() === this.companyName.toLowerCase().trim()
      );
    }

    this.jobs = result;
    this.sortJobs();
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  sortJobs() {
    if (!this.jobs || this.jobs.length === 0) return;
    if (this.sortBy === 'Stipend: highest') {
      this.jobs.sort((a, b) => this.extractNumericStipend(b.stipend || b.salary) - this.extractNumericStipend(a.stipend || a.salary));
    } else if (this.sortBy === 'Newest posted') {
      this.jobs.sort((a, b) => new Date(b.postedAt || 0).getTime() - new Date(a.postedAt || 0).getTime());
    } else if (this.sortBy === 'Deadline: soonest') {
      this.jobs.sort((a, b) => {
        const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return da - db;
      });
    }
  }

  extractNumericStipend(val: string): number {
    if (!val) return 0;
    const clean = String(val).replace(/,/g, '');
    const m = clean.match(/\d+/);
    if (!m) return 0;
    let n = parseInt(m[0], 10);
    if (String(val).includes('$')) n *= 300;
    return n;
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
    if (diff < 0) return '#ef4444';
    if (diff <= 3) return '#f59e0b';
    return '#5046e5';
  }

  formatPostedDate(dateStr?: string): string {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const time = date.getTime();
    if (isNaN(time)) return dateStr;

    const diffMs = Date.now() - time;

    if (diffMs < 60 * 1000) {
      return 'Just now';
    }

    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks}w ago`;
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  get categoryTitle(): string {
    const checkedCats = this.categories.filter(c => c.checked).map(c => c.name);
    if (checkedCats.length === 1) return checkedCats[0];
    if (checkedCats.length > 1) return `${checkedCats.length} Categories`;
    if (this.selectedCategory) return this.selectedCategory;
    return 'All Categories';
  }

  // Clear all filters method to reset UI parameters and reload all data
  clearAllFilters() {
    this.searchKeyword = '';
    this.searchLocation = '';
    this.selectedCategory = '';
    this.selectedWorkMode = '';
    this.minStipend = 0;
    this.sortBy = 'Deadline: soonest';
    
    this.categories.forEach(c => c.checked = false);
    this.jobLevels.forEach(l => l.checked = false);

    this.fetchFilteredJobs();
  }

  resetStipend() {
    this.minStipend = 0;
    this.fetchFilteredJobs();
  }

  onFilterChange() {
    this.fetchFilteredJobs();
  }

  onCategoryChange() {
    this.fetchFilteredJobs();
  }

  onSortChange() {
    this.sortJobs();
  }

  filterJobs(type: string) {
    this.fetchFilteredJobs();
  }

  selectCategory(categoryName: string) {
    this.selectedCategory = this.selectedCategory === categoryName ? '' : categoryName;
    this.fetchFilteredJobs();
  }

  selectWorkMode(mode: string) {
    this.selectedWorkMode = this.selectedWorkMode === mode ? '' : mode;
    this.fetchFilteredJobs();
  }

  onSearch() {
    this.fetchFilteredJobs();
  }

  applyForJob(job: any): void {
    if (!this.isSeekerLoggedIn) {
      alert('Please log in as a job seeker to apply for this job.');
      this.router.navigate(['/job-seeker/login']);
      return;
    }

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

    const payload = {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      seekerName: seekerName || 'Kasun Perera',
      seekerEmail: seekerEmail,
      phone: '+94 77 123 4567',
      location: 'Colombo, Sri Lanka',
      education: 'BSc in Computer Science',
      experience: '3+ years building modern applications',
      coverLetter: `Hello, I am excited to apply for the ${job.title} role at ${job.company}. My profile and CV are submitted for your review.`,
      resumeFileName: isPlatformBrowser(this.platformId) ? (localStorage.getItem(`seekerResumeName_${seekerEmail}`) || 'Kasun_Perera_Resume.pdf') : 'Kasun_Perera_Resume.pdf',
      resumeData: isPlatformBrowser(this.platformId) ? (localStorage.getItem(`seekerResumeData_${seekerEmail}`) || '') : ''
    };

    this.http.post<any>('http://localhost:3000/api/applications/apply', payload).subscribe({
      next: (res) => {
        alert(res.message || 'Application submitted successfully!');
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to submit application.');
      }
    });
  }

  // Navigation & UI Menu Toggles requested by template
  toggleJobMenu() { 
    this.isJobDropdownOpen = !this.isJobDropdownOpen; 
  }
  
  toggleDropdown() { 
    this.isDropdownOpen = !this.isDropdownOpen; 
  }

  toggleSeekerDropdown() { 
    this.isSeekerDropdownOpen = !this.isSeekerDropdownOpen; 
  }

  setCompanyFilterMode(mode: 'my-company' | 'all-jobs') {
    this.companyFilterMode = mode;
    this.applyFilters();
  }

  isMyCompanyJob(job: any): boolean {
    if (!this.isCompanyLoggedIn || !job || !job.company) return false;
    return job.company.toLowerCase().trim() === this.companyName.toLowerCase().trim();
  }

  getMyCompanyJobsCount(): number {
    return this.allJobs.filter(j => this.isMyCompanyJob(j)).length;
  }

  editJobFromHome(jobId: number) {
    this.router.navigate(['/company/edit-job'], { queryParams: { id: jobId } });
  }

  goToHomeTop() {
    this.clearAllFilters();
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  scrollToJobs() {
    if (isPlatformBrowser(this.platformId)) {
      const el = document.querySelector('.content');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  filterTopCompanies() {
    this.searchKeyword = 'Technova';
    this.applyFilters();
    this.scrollToJobs();
  }

  filterSalaryGuide() {
    this.minStipend = 75000;
    this.sortBy = 'Stipend: highest';
    this.applyFilters();
    this.scrollToJobs();
  }

  viewActiveCompanies() {
    this.filterTopCompanies();
  }

  goToPostJob() {
    this.router.navigate(['/company/post-job'], { queryParams: { returnUrl: '/' } });
  }

  goToEditCompanyProfile() {
    this.router.navigate(['/company/profile']);
  }

  goToEditPost() {
    this.router.navigate(['/company/settings']);
  }

  goToPostStatus() {
    this.router.navigate(['/company/applicants']);
  }

  goToSeekerProfile() {
    this.router.navigate(['/job-seeker/profile']);
  }

  goToSeekerJobs() {
    this.router.navigate(['/job-seeker/jobs']);
  }

 startSeekerFlow() {
    this.router.navigate(['/job-seeker/login']);
  }

  startCompanyFlow() {
    this.router.navigate(['/company/login']);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('isCompanyLoggedIn');
      localStorage.removeItem('companyName');
      localStorage.removeItem('companyEmail');
    }
    this.isCompanyLoggedIn = false;
    this.companyFilterMode = 'my-company';
    this.applyFilters();
    this.fetchProfileDashboardStats();
    this.router.navigate(['/']);
  }

  logoutSeeker() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('isSeekerLoggedIn');
      localStorage.removeItem('seekerName');
      localStorage.removeItem('seekerEmail');
    }
    this.isSeekerLoggedIn = false;
    this.applyFilters();
    this.fetchProfileDashboardStats();
    this.router.navigate(['/']);
  }
}