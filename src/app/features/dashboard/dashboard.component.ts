import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserProfile } from '../../features/auth/models/auth.model';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);

  currentUser: UserProfile | null = null;
  loading = true;

  ngOnInit(): void {
    // S'abonner aux changements d'utilisateur
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.loading = false;
    });
  }

  logout(): void {
    this.authService.logout();
  }

}
