import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-job-seeker-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './job-seeker-profile.html',
  styleUrls: ['./job-seeker-profile.css']
})
export class JobSeekerProfile {
  profileForm: FormGroup;
  avatarPreview: string | ArrayBuffer | null = null;
  resumeFileName: string = '';
  isSaved: boolean = false;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      jobTitle: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      location: [''],
      bio: [''],
      skills: [''],
      portfolioUrl: ['']
    });
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onResumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.resumeFileName = input.files[0].name;
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      console.log('Profile Data:', this.profileForm.value);
      this.isSaved = true;
      setTimeout(() => (this.isSaved = false), 3000);
    }
  }
}