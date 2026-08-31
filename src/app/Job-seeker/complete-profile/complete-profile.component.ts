import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule], 
  templateUrl: './complete-profile.component.html',
  styleUrl: './complete-profile.component.css'
})
export class CompleteProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  profileForm!: FormGroup;
  avatarPreview: string | ArrayBuffer | null = null;
  resumeFileName: string = '';
  isSaved: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // 1. Array to hold the skill bubbles
  skillsList: string[] = [];

  ngOnInit(): void {
    let savedName = '';
    let savedEmail = '';

    if (isPlatformBrowser(this.platformId)) {
      savedName = localStorage.getItem('seekerName') || '';
      savedEmail = localStorage.getItem('seekerEmail') || '';
    }

    this.profileForm = this.fb.group({
      fullName: [savedName, Validators.required],
      jobTitle: [''],
      email: [savedEmail, Validators.required],
      phone: ['', Validators.required],
      location: [''],
      bio: [''],
      skills: ['']
    });

    if (savedEmail) {
      this.http.get<any>(`http://localhost:3000/api/seeker/profile/${encodeURIComponent(savedEmail)}`).subscribe({
        next: (res) => {
          if (res && res.success && res.profile) {
            const p = res.profile;
            this.profileForm.patchValue({
              fullName: p.fullName || savedName,
              jobTitle: p.jobTitle || '',
              email: p.email || savedEmail,
              phone: p.phone || '',
              location: p.location || '',
              bio: p.bio || '',
              skills: p.skills || ''
            });

            if (p.skills) {
              this.skillsList = p.skills
                .split(',')
                .map((s: string) => s.trim())
                .filter((s: string) => s !== '');
            }
          }
        },
        error: () => {}
      });
    }
  }

  // 2. Add Skill Logic
  addSkill(event: Event): void {
    event.preventDefault(); 
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value.trim();

    if (value && !this.skillsList.includes(value)) {
      this.skillsList.push(value);
      this.updateSkillsForm();
    }
    inputElement.value = ''; 
  }

  // 3. Remove Skill Logic
  removeSkill(skillToRemove: string): void {
    this.skillsList = this.skillsList.filter(skill => skill !== skillToRemove);
    this.updateSkillsForm();
  }

  private updateSkillsForm(): void {
    this.profileForm.patchValue({ skills: this.skillsList.join(', ') });
  }

  onAvatarChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  resumeData: string = '';

  onResumeChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.resumeFileName = file.name;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.resumeData = e.target.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.resumeFileName = '';
      this.resumeData = '';
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const formVals = this.profileForm.value;
    const formData = {
      ...formVals,
      resumeFileName: this.resumeFileName,
      resumeData: this.resumeData
    };

    this.http.post<any>('http://localhost:3000/api/seeker/complete-profile', formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSaved = true; 
        
        if (isPlatformBrowser(this.platformId)) {
          try {
            localStorage.setItem('isSeekerLoggedIn', 'true');
            if (formData.fullName) {
              localStorage.setItem('seekerName', formData.fullName);
            }
            if (formData.email) {
              localStorage.setItem('seekerEmail', formData.email);
              if (this.resumeFileName) {
                localStorage.setItem(`seekerResumeName_${formData.email}`, this.resumeFileName);
              }
              if (this.resumeData && this.resumeData.length < 2000000) {
                localStorage.setItem(`seekerResumeData_${formData.email}`, this.resumeData);
              }
            }
          } catch (storageErr) {
            console.warn('LocalStorage quota warning:', storageErr);
          }
        }
        
        setTimeout(() => {
          this.router.navigate(['/job-seeker/profile']);
        }, 400);
      },
      error: (err) => {
        console.error('Failed to save profile', err);
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to save profile details. Please try again.';
      }
    });
  }
}