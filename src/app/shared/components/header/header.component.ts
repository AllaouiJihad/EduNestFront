import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {AuthService} from "../../../core/services/auth.service";
import {User,UserRole} from "../../../core/models/user";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{
  constructor(private cdr: ChangeDetectorRef) {}

  private authService = inject(AuthService);

  isMenuOpen = false;
  isUserMenuOpen = false;
  currentUser: User | null = null;
  UserRole = UserRole;

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUser = currentUser;
    }
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.cdr.detectChanges();
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    if (this.isUserMenuOpen) {
      this.isMenuOpen = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.isUserMenuOpen = false;
  }

}
