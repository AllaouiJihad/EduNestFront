import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { FormErrorsComponent } from '../../../../shared/components/form-errors/form-errors.component';
import { PasswordValidators } from '../../../../shared/validators/password-validator';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AlertComponent,
    FormErrorsComponent
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit  {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token = '';
  resetPasswordForm: FormGroup = this.fb.group({
    password: ['', [Validators.required, PasswordValidators.strong()]],
    confirmPassword: ['', Validators.required]
  }, {
    validators: PasswordValidators.matchPasswords('password', 'confirmPassword')
  });

  loading = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';

  get f() { return this.resetPasswordForm.controls; }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || '';

    if (!this.token) {
      this.errorMessage = 'Token de réinitialisation manquant. Veuillez vérifier le lien dans votre email.';
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.resetPasswordForm.invalid || !this.token) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.resetPassword({
      token: this.token,
      newPassword: this.f['password'].value
    })
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.successMessage = 'Votre mot de passe a été réinitialisé avec succès.';
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Une erreur s\'est produite lors de la réinitialisation. Veuillez réessayer.';
        }
      });
  }
}
