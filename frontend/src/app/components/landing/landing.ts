import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class LandingComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Don't automatically redirect - let users choose to go to dashboard
  }

  start() {
    this.router.navigate(['/login']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
