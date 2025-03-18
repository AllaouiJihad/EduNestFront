import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AlertComponent
  ],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.css'
})
export class VerificationComponent implements OnInit {
private authService = inject(AuthService);
private route = inject(ActivatedRoute);
private router = inject(Router);

  token = '';
  loading = true;
  verifying = false;
  verified = false;
  errorMessage = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || '';

    if (!this.token) {
    this.loading = false;
    this.errorMessage = 'Token de vérification manquant. Veuillez vérifier le lien dans votre email.';
    return;
  }

  this.verifyAccount();
}

  verifyAccount(): void {
    this.verifying = true;
    this.errorMessage = '';

    this.authService.verifyAccount(this.token)
      .pipe(finalize(() => {
        this.loading = false;
        this.verifying = false;
      }))
      .subscribe({
        next: () => {
          this.verified = true;
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 5000);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Le lien de vérification est invalide ou a expiré.';
        }
      });
  }

}
