import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

// ==========================================
// COMPANY ROUTES
// ==========================================
import { LoginComponent as CompanyLoginComponent } from './Company/login/login'; 
import { RegistrationComponent } from './Company/registration/registration'; 
import { PostJobComponent } from './Company/post-job/post-job.component'; 
import { SettingsComponent } from './Company/settings/settings.component'; 
import { ManageApplicantsComponent } from './Company/manage-applicants/manage-applicants'; 
import { EditCompanyProfileComponent } from './Company/edit-company-profile/edit-company-profile'; 
import { EditJobComponent } from './Company/edit-job/edit-job.component'; 

// ==========================================
// JOB SEEKER ROUTES
// ==========================================
import { LoginComponent as SeekerLoginComponent } from './Job-seeker/login/login';
import { RegisterComponent } from './Job-seeker/register/register';
// FIXED: Added .component to the end of the import path below!
import { JobSeekerProfileComponent } from './Job-seeker/job-seeker-profile/job-seeker-profile.component'; 
import { JobSeekerJobsComponent } from './Job-seeker/job-seeker-jobs/job-seeker-jobs'; 
import { CompleteProfileComponent } from './Job-seeker/complete-profile/complete-profile.component'; 

export const routes: Routes = [
  // Default Home Route
  { path: '', component: HomeComponent },
  
  // --- Company Flow ---
  { path: 'company/login', component: CompanyLoginComponent },
  { path: 'company/register', component: RegistrationComponent },
  { path: 'company/post-job', component: PostJobComponent },
  { path: 'company/settings', component: SettingsComponent },
  { path: 'company/applicants', component: ManageApplicantsComponent },
  { path: 'company/profile', component: EditCompanyProfileComponent },
  { path: 'company/edit-job', component: EditJobComponent },

  // --- Job Seeker Flow ---
  { path: 'job-seeker/login', component: SeekerLoginComponent },
  { path: 'job-seeker/register', component: RegisterComponent },
  { path: 'job-seeker/profile', component: JobSeekerProfileComponent },
  { path: 'job-seeker/jobs', component: JobSeekerJobsComponent },
  { path: 'job-seeker/complete-profile', component: CompleteProfileComponent }
];