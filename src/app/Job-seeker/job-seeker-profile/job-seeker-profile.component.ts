import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // <-- Added Router

@Component({
  selector: 'app-job-seeker-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './job-seeker-profile.component.html',
  styleUrl: './job-seeker-profile.component.css'
})
export class JobSeekerProfileComponent implements OnInit {
  profileForm!: FormGroup;
  avatarPreview: string | ArrayBuffer | null = null;
  resumeFileName = '';
  isSaved = false;

  // Added Router to the constructor
  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.profileForm = this.fb.group({
      fullName: ['Sadeesa Damruwan', Validators.required],
      jobTitle: ['Software Engineer', Validators.required],
      email: ['contact@example.com', [Validators.required, Validators.email]],
      phone: ['+94 7X XXX XXXX', Validators.required],
      location: ['Sri Lanka', Validators.required],
      bio: ['Software Engineering undergraduate at NSBM Green University. Passionate about mobile and web development.', Validators.required],
      skills: ['Flutter, React, Node.js, Python, Java', Validators.required]
    });
  }

  onAvatarChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => this.avatarPreview = e.target?.result || null;
      reader.readAsDataURL(file);
    }
  }

  onResumeChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.resumeFileName = file.name;
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      console.log('Saved Profile Data:', this.profileForm.value);
      
      this.isSaved = true;
      
      // Redirect to the Job Seeker Dashboard after 1.5 seconds!
      setTimeout(() => {
        this.router.navigate(['/job-seeker/jobs']);
      }, 1500);

    } else {
      this.profileForm.markAllAsTouched();
    }
  }
}