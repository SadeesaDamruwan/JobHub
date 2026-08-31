import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobSeekerJobs } from './job-seeker-jobs';

describe('JobSeekerJobs', () => {
  let component: JobSeekerJobs;
  let fixture: ComponentFixture<JobSeekerJobs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobSeekerJobs],
    }).compileComponents();

    fixture = TestBed.createComponent(JobSeekerJobs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
