import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { FormErrorsComponent } from '../../../../shared/components/form-errors/form-errors.component';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AlertComponent,
    FormErrorsComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false]
  });
  loading = false;
  submitted = false;
  errorMessage = '';

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login({
      email: this.f['email'].value,
      password: this.f['password'].value
    })
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          // Get return url from query parameters or default to home page
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          this.router.navigateByUrl(returnUrl);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Identifiants incorrects. Veuillez réessayer.';
        }
      });
  }

}
