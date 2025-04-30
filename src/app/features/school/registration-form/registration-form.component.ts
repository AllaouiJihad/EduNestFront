import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatStepper, MatStepperModule} from "@angular/material/stepper";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatCardModule} from "@angular/material/card";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatSelectModule} from "@angular/material/select";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import { SchoolRegistrationService } from '../../../core/services/school-registration.service';
import {ActivatedRoute, Router} from "@angular/router";
import {CategoryService} from "../../../core/services/category.service";
import {Category} from "../../../core/models/category";
import {catchError, EMPTY, finalize} from "rxjs";
import {SchoolRegistrationRequest} from "../../../core/models/school-registration-request";
import {tap} from "rxjs/operators";
import {InfoCardComponent} from "./info-card/info-card.component";
import {ConfirmDialogComponent} from "../../../shared/components/confirm-dialog/confirm-dialog.component";
import {LoaderComponent} from "../../../shared/components/loader/loader.component";

@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatDialogModule,
    LoaderComponent,
    InfoCardComponent
  ],
  templateUrl: './registration-form.component.html',
  styleUrl: './registration-form.component.css',
})
export class RegistrationFormComponent implements OnInit{
  @ViewChild('stepper') stepper!: MatStepper;

  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private registrationService = inject(SchoolRegistrationService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);

  basicInfoForm!: FormGroup;
  contactInfoForm!: FormGroup;
  additionalInfoForm!: FormGroup;

  categories: Category[] = [];
  loading = true;
  submitting = false;
  resubmitId: number | null = null;

  ngOnInit(): void {
    this.initForms();
    this.loadCategories();
    this.checkForResubmit();
  }

  initForms(): void {
    this.basicInfoForm = this.fb.group({
      schoolName: ['', [Validators.required]],
      categoryId: ['', [Validators.required]],
      schoolDescription: ['', [Validators.required, Validators.minLength(50)]]
    });

    this.contactInfoForm = this.fb.group({
      schoolAddress: ['', [Validators.required]],
      schoolPostalCode: ['', [Validators.required, Validators.pattern('[0-9]{5}')]],
      schoolCity: ['', [Validators.required]],
      schoolPhoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$|^[0-9]{2}\\s[0-9]{2}\\s[0-9]{2}\\s[0-9]{2}\\s[0-9]{2}$')]],
      schoolEmail: ['', [Validators.required, Validators.email]],
      schoolWebsite: ['', [Validators.pattern('https?://.+')]]
    });

    this.additionalInfoForm = this.fb.group({
      additionalInfo: ['']
    });
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getAllActiveCategories()
      .pipe(
        catchError(err => {
          this.showErrorMessage('Erreur lors du chargement des catégories', err);
          return EMPTY;
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(categories => {
        this.categories = categories;
      });
  }

  checkForResubmit(): void {
    this.route.queryParams.subscribe(params => {
      const resubmitId = params['resubmit'];
      if (resubmitId) {
        this.resubmitId = Number(resubmitId);
        this.loadPreviousRequest(this.resubmitId);
      }
    });
  }

  loadPreviousRequest(requestId: number): void {
    this.loading = true;
    // Simulation - dans une implémentation réelle, on récupérerait les détails de la demande précédente
    // pour pré-remplir le formulaire
    setTimeout(() => {
      // Simulation de données pré-remplies
      this.basicInfoForm.patchValue({
        schoolName: 'École Supérieure (Demande précédente)',
        categoryId: this.categories.length > 0 ? this.categories[0].id : '',
        schoolDescription: 'Ceci est une nouvelle soumission suite à une demande refusée. Notre établissement offre une formation de qualité dans différents domaines...'
      });

      this.contactInfoForm.patchValue({
        schoolAddress: '123 Avenue de la République',
        schoolPostalCode: '75011',
        schoolCity: 'Paris',
        schoolPhoneNumber: '01 23 45 67 89',
        schoolEmail: 'contact@ecole-superieure.fr',
        schoolWebsite: 'https://www.ecole-superieure.fr'
      });

      this.loading = false;

      this.snackBar.open('Le formulaire a été pré-rempli avec les informations de votre demande précédente', 'Fermer', {
        duration: 5000
      });
    }, 1000);
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  }

  isFormValid(): boolean {
    return this.basicInfoForm.valid && this.contactInfoForm.valid;
  }

  confirmSubmit(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la soumission',
        message: 'Êtes-vous sûr de vouloir soumettre cette demande d\'enregistrement d\'établissement ?',
        confirmText: 'Soumettre',
        confirmColor: 'primary',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.processSubmission();
      }
    });
  }

  submitRegistration(): void {
    if (!this.isFormValid()) return;

    if (this.isFormValid()) {
      this.confirmSubmit();
    }
  }

  processSubmission(): void {
    this.submitting = true;

    const request: SchoolRegistrationRequest = {
      schoolName: this.basicInfoForm.get('schoolName')?.value,
      schoolAddress: this.contactInfoForm.get('schoolAddress')?.value,
      schoolPostalCode: this.contactInfoForm.get('schoolPostalCode')?.value,
      schoolCity: this.contactInfoForm.get('schoolCity')?.value,
      schoolPhoneNumber: this.contactInfoForm.get('schoolPhoneNumber')?.value,
      schoolEmail: this.contactInfoForm.get('schoolEmail')?.value,
      schoolWebsite: this.contactInfoForm.get('schoolWebsite')?.value || undefined,
      schoolDescription: this.basicInfoForm.get('schoolDescription')?.value,
      categoryId: this.basicInfoForm.get('categoryId')?.value,
      additionalInfo: this.additionalInfoForm.get('additionalInfo')?.value || undefined
    };

    let submission$ = this.registrationService.submitSchoolRegistration(request);

    // Si c'est une nouvelle soumission d'une demande refusée
    if (this.resubmitId) {
      submission$ = submission$.pipe(
        tap(response => {
          // Logique spécifique pour une nouvelle soumission
          console.log(`Resubmission for request ID ${this.resubmitId} successful`);
        })
      );
    }

    submission$
      .pipe(
        catchError(err => {
          this.showErrorMessage('Erreur lors de la soumission de la demande', err);
          return EMPTY;
        }),
        finalize(() => this.submitting = false)
      )
      .subscribe(response => {
        this.showSuccessMessage();
        this.navigateToMyRequests();
      });
  }

  showSuccessMessage(): void {
    this.snackBar.open('Demande d\'enregistrement soumise avec succès !', 'Fermer', {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }

  showErrorMessage(message: string, err: any): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
    console.error(message, err);
  }

  navigateToMyRequests(): void {
    this.router.navigate(['/school-registration/my-requests']);
  }

  resetForm(): void {
    this.basicInfoForm.reset();
    this.contactInfoForm.reset();
    this.additionalInfoForm.reset();
    this.stepper.reset();
  }

}
