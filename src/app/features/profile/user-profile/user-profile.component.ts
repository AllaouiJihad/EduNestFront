import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
// Supprimé l'import de MatTabsModule qui posait problème
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../../core/services/auth.service";
import { Router } from "@angular/router";
import { User, UserRole } from "../../../core/models/user";
import { take } from "rxjs";
import { LoaderComponent } from "../../../shared/components/loader/loader.component";
import { UserReviewsComponent } from "../../../shared/components/user-reviews/user-reviews.component";

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    // Supprimé MatTabsModule des imports
    LoaderComponent,
    UserReviewsComponent
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  currentUser: User | null = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  // Ajouté pour la gestion des onglets personnalisés
  activeTab: string = 'personal';

  ngOnInit(): void {
    this.initForms();

    this.authService.currentUser$.pipe(take(1)).subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone || ''
        });
      }
    });
  }

  initForms(): void {
    this.profileForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });

    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup): {[key: string]: boolean} | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return newPassword === confirmPassword ? null : { 'passwordMismatch': true };
  }

  saveProfile(): void {
    if (this.profileForm.valid && this.profileForm.dirty) {
      // TODO: Implement profile update service
      this.snackBar.open('Profil mis à jour avec succès', 'Fermer', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      // TODO: Implement password change service
      this.snackBar.open('Mot de passe modifié avec succès', 'Fermer', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      this.passwordForm.reset();
    }
  }

  getRoleLabel(role: UserRole): string {
    switch(role) {
      case UserRole.ADMIN:
        return 'Administrateur';
      case UserRole.SCHOOL_ADMIN:
        return 'Administrateur d\'établissement';
      case UserRole.SCHOOL_STAFF:
        return 'Personnel d\'établissement';
      case UserRole.MEMBER:
      default:
        return 'Membre';
    }
  }
}
