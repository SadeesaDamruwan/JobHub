import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Applicant {
  id: number;
  name: string;
  initials: string;
  roleApplied: string;
  appliedDate: string;
  email: string;
  phone: string;
  experience: string;
  education: string;
  status: string;
  coverLetter: string;
}

@Component({
  selector: 'app-manage-applicants',
  standalone: true,
  imports: [CommonModule],
  // Updated to the standard CLI template name
  templateUrl: './manage-applicants.component.html' 
})
export class ManageApplicantsComponent implements OnInit {
  
  applicants: Applicant[] = [
    {
      id: 1,
      name: 'Kasun Perera',
      initials: 'KP',
      roleApplied: 'Senior Software Engineer',
      appliedDate: '2 hours ago',
      email: 'kasun.p@email.com',
      phone: '+94 77 123 4567',
      experience: '5 Years - Full Stack',
      education: 'BSc Computer Science, NSBM Green University',
      status: 'New',
      coverLetter: 'I am a highly motivated software engineer with 5 years of experience building scalable web applications. I am very interested in bringing my skills to your engineering team.'
    },
    {
      id: 2,
      name: 'Amandi Silva',
      initials: 'AS',
      roleApplied: 'Product Designer',
      appliedDate: '1 day ago',
      email: 'amandi.design@email.com',
      phone: '+94 71 987 6543',
      experience: '3 Years - UI/UX',
      education: 'BA Graphic Design',
      status: 'Reviewed',
      coverLetter: 'Attached is my portfolio showcasing my previous work in SaaS product design. I specialize in creating intuitive user experiences and would love to discuss this role further.'
    },
    {
      id: 3,
      name: 'Dinuka Rajapakse',
      initials: 'DR',
      roleApplied: 'Senior Software Engineer',
      appliedDate: '2 days ago',
      email: 'dinuka.dev@email.com',
      phone: '+94 70 555 1234',
      experience: '4 Years - Backend',
      education: 'BSc IT',
      status: 'New',
      coverLetter: 'With a strong background in backend systems and database architecture, I am confident I can contribute immediately to your ongoing projects.'
    }
  ];

  selectedApplicant: Applicant | null = null;

  ngOnInit() {
    if (this.applicants.length > 0) {
      this.selectedApplicant = this.applicants[0];
    }
  }

  selectApplicant(applicant: Applicant) {
    this.selectedApplicant = applicant;
  }
}