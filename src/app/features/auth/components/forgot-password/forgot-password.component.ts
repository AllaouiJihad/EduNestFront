import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { FormErrorsComponent } from '../../../../shared/components/form-errors/form-errors.component';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AlertComponent,
    FormErrorsComponent
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  forgotPasswordForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  loading = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';

  get f() { return this.forgotPasswordForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.forgotPassword(this.f['email'].value)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.successMessage = 'Si l\'adresse email existe, vous recevrez bientôt un email avec les instructions pour réinitialiser votre mot de passe.';
          this.forgotPasswordForm.reset();
          this.submitted = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Une erreur s\'est produite. Veuillez réessayer.';
        }
      });
  }
}
