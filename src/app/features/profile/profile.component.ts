import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {
  AbstractControl,
  FormControl,
  FormGroup, FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from "@angular/forms";
import {NavbarComponent} from "../../shared/components/navbar/navbar.component";
import {FooterComponent} from "../../shared/components/footer/footer.component";
import {LoadingSpinnerComponent} from "../../shared/components/loading-spinner/loading-spinner.component";
import {ErrorAlertComponent} from "../../shared/components/error-alert/error-alert.component";
import { UserProfile } from '../auth/models/auth.model';
import {AuthService} from "../../core/services/auth.service";
import {ToastService} from "../../core/services/toast.service";

// Fonction validatrice à l'extérieur de la classe

function booleanValidator(control: AbstractControl): ValidationErrors | null {

  const value = control.value;

  if (typeof value !== 'boolean') {

    return { notBoolean: true };

  }

  return null;

}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NavbarComponent,
    FooterComponent,
    LoadingSpinnerComponent,
    ErrorAlertComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  userProfile: UserProfile | null = null;
  loading: boolean = false;
  error: string | null = null;
  activeTab: 'info' | 'password' | 'preferences' = 'info';

  profileForm: FormGroup = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl({ value: '', disabled: true }),
    profileImageUrl: new FormControl('')
  });

  passwordForm: FormGroup = new FormGroup({
    currentPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    ]),
    confirmPassword: new FormControl('', [Validators.required])
  }, this.passwordMatchValidator);







// Ajoutez ce validateur à vos contrôles
  preferencesForm: FormGroup = new FormGroup({
    emailNotifications: new FormControl(true, [booleanValidator]),
    newSchoolAlerts: new FormControl(false, [booleanValidator]),
    favoriteUpdates: new FormControl(true, [booleanValidator]),
    marketingEmails: new FormControl(false, [booleanValidator])
  });

  constructor(
    private authService: AuthService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.loading = true;
    this.error = null;

    this.authService.currentUser$.subscribe({
      next: (user) => {
        this.userProfile = user;
        this.loading = false;

        if (user) {
          this.profileForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profileImageUrl: user.profileImageUrl || ''
          });
        } else {
          this.error = 'Impossible de charger votre profil. Veuillez vous reconnecter.';
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement du profil:', err);
        this.loading = false;
        this.error = 'Impossible de charger votre profil. Veuillez réessayer plus tard.';
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    // Simuler une mise à jour du profil (à remplacer par un appel API réel)
    setTimeout(() => {
      this.loading = false;
      this.toastService.success('Profil mis à jour', 'Vos informations ont été enregistrées avec succès.');
    }, 1000);
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    // Simuler un changement de mot de passe (à remplacer par un appel API réel)
    setTimeout(() => {
      this.loading = false;
      this.passwordForm.reset();
      this.toastService.success('Mot de passe mis à jour', 'Votre mot de passe a été modifié avec succès.');
    }, 1000);
  }

  savePreferences(): void {
    if (this.preferencesForm.invalid) {
      this.preferencesForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    // Simuler une mise à jour des préférences (à remplacer par un appel API réel)
    setTimeout(() => {
      this.loading = false;
      this.toastService.success('Préférences mises à jour', 'Vos préférences de notification ont été enregistrées.');
    }, 1000);
  }

  changeTab(tab: 'info' | 'password' | 'preferences'): void {
    this.activeTab = tab;
  }



  getFirstLetter(): string {
    return this.userProfile?.firstName?.charAt(0).toUpperCase() || '?';
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }




}
