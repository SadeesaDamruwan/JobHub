import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  email = '';
  password = '';
  confirmPassword = '';

  constructor(private router: Router) {}

  register() {
    if (!this.email || !this.password || !this.confirmPassword) {
      alert('Please fill out all required fields.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match. Please try again.');
      return;
    }
    
    // Set the Seeker as logged in!
    localStorage.setItem('isSeekerLoggedIn', 'true');
    
    this.router.navigate(['/job-seeker/profile']);
  }
}