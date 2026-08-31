import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { JobSeekerJobs } from './job-seeker-jobs.component';

describe('JobSeekerJobs', () => {
  let component: JobSeekerJobs;
  let fixture: ComponentFixture<JobSeekerJobs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobSeekerJobs],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting() // Safely catches any HTTP requests during tests
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(JobSeekerJobs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});