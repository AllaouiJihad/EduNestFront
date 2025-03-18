import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { FormErrorsComponent } from '../../../../shared/components/form-errors/form-errors.component';
import { PasswordValidators } from '../../../../shared/validators/password-validator';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AlertComponent,
    FormErrorsComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, PasswordValidators.strong()]],
    confirmPassword: ['', Validators.required],
    acceptTerms: [false, Validators.requiredTrue]
  }, {
    validators: PasswordValidators.matchPasswords('password', 'confirmPassword')
  });

  loading = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';

  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.register({
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      email: this.f['email'].value,
      password: this.f['password'].value
    })
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.successMessage = 'Inscription réussie ! Un email de vérification a été envoyé à votre adresse email.';
          // Réinitialiser le formulaire après un court délai
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Une erreur s\'est produite lors de l\'inscription. Veuillez réessayer.';
        }
      });
  }

}
