import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FooterComponent} from "../../../shared/components/footer/footer.component";
import {LoadingSpinnerComponent} from "../../../shared/components/loading-spinner/loading-spinner.component";
import {ErrorAlertComponent} from "../../../shared/components/error-alert/error-alert.component";
import {NavbarComponent} from "../../../shared/components/navbar/navbar.component";
import { Category } from '../../../core/models/category';
import {SchoolService} from "../../../core/services/school.service";
import {ToastService} from "../../../core/services/toast.service";
import {Router} from "@angular/router";
import {AuthService} from "../../../core/services/auth.service";
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";

interface SchoolRegistrationForm {
  basicInfo: FormGroup;
  contactInfo: FormGroup;
  detailedInfo: FormGroup;
  termsAgreement: FormGroup;
}

@Component({
  selector: 'app-register-school',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavbarComponent,
    FooterComponent,
    LoadingSpinnerComponent,
    ErrorAlertComponent

  ],
  templateUrl: './register-school.component.html',
  styleUrl: './register-school.component.css'
})
export class RegisterSchoolComponent implements OnInit {
  currentStep: number = 1;
  totalSteps: number = 4;
  loading: boolean = false;
  error: string | null = null;
  categories: Category[] = [];
  isAuthenticated: boolean = false;

  registrationForm: SchoolRegistrationForm = {
    basicInfo: new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      categoryId: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required, Validators.minLength(50)]),
      foundedYear: new FormControl('', [Validators.pattern(/^\d{4}$/)])
    }),

    contactInfo: new FormGroup({
      address: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      postalCode: new FormControl('', [Validators.required, Validators.pattern(/^\d{5}$/)]),
      phoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^(\+\d{1,3})?[-.\s]?\d{9,10}$/)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      websiteUrl: new FormControl('', [Validators.pattern(/^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?$/)])
    }),

    detailedInfo: new FormGroup({
      facilitiesAndAmenities: new FormArray<FormControl<string | null>>([
        new FormControl('')
      ]),
      programs: new FormArray<FormGroup>([
        new FormGroup({
          name: new FormControl('', [Validators.required]),
          description: new FormControl(''),
          duration: new FormControl('')
        })
      ]),
      additionalInfo: new FormControl('')
    }),

    termsAgreement: new FormGroup({
      acceptTerms: new FormControl(false, [Validators.requiredTrue]),
      acceptPrivacyPolicy: new FormControl(false, [Validators.requiredTrue])
    })
  };

  constructor(
    private schoolService: SchoolService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.checkAuthentication();
  }

  checkAuthentication(): void {
    this.authService.isAuthenticated$.subscribe(
      isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
      }
    );
  }

  loadCategories(): void {
    this.loading = true;

    this.schoolService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des catégories:', err);
        this.error = 'Impossible de charger les catégories d\'écoles. Veuillez réessayer plus tard.';
        this.loading = false;
      }
    });
  }

  nextStep(): void {
    // Valider le formulaire de l'étape actuelle
    const currentFormGroup = this.getCurrentFormGroup();
    if (currentFormGroup.invalid) {
      currentFormGroup.markAllAsTouched();
      this.toastService.error('Formulaire incomplet', 'Veuillez remplir tous les champs obligatoires avant de continuer.');
      return;
    }

    // Si c'est la dernière étape, soumettre le formulaire
    if (this.currentStep === this.totalSteps) {
      this.submitRegistration();
      return;
    }

    // Passer à l'étape suivante
    this.currentStep++;
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  getCurrentFormGroup(): FormGroup {
    switch(this.currentStep) {
      case 1:
        return this.registrationForm.basicInfo;
      case 2:
        return this.registrationForm.contactInfo;
      case 3:
        return this.registrationForm.detailedInfo;
      case 4:
        return this.registrationForm.termsAgreement;
      default:
        return this.registrationForm.basicInfo;
    }
  }

  get facilitiesAndAmenities(): FormArray<FormControl<string | null>> {
    return this.registrationForm.detailedInfo.get('facilitiesAndAmenities') as FormArray<FormControl<string | null>>;
  }

  addFacility(): void {
    this.facilitiesAndAmenities.push(new FormControl<string | null>(''));
  }

  removeFacility(index: number): void {
    if (index > 0) { // Toujours garder au moins un champ
      this.facilitiesAndAmenities.removeAt(index);
    }
  }

  get programs(): FormArray<FormGroup> {
    return this.registrationForm.detailedInfo.get('programs') as FormArray<FormGroup>;
  }

  addProgram(): void {
    this.programs.push(new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      duration: new FormControl('')
    }));
  }

  removeProgram(index: number): void {
    if (index > 0) { // Toujours garder au moins un programme
      this.programs.removeAt(index);
    }
  }

  submitRegistration(): void {
    // Vérifier si l'utilisateur est authentifié
    if (!this.isAuthenticated) {
      this.toastService.error('Authentification requise', 'Veuillez vous connecter pour enregistrer votre école.');
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    // Vérifier la validité de tous les formulaires
    if (
      this.registrationForm.basicInfo.invalid ||
      this.registrationForm.contactInfo.invalid ||
      this.registrationForm.detailedInfo.invalid ||
      this.registrationForm.termsAgreement.invalid
    ) {
      this.toastService.error('Formulaire incomplet', 'Veuillez vérifier tous les champs obligatoires.');
      return;
    }

    this.loading = true;

    // Préparer les données pour l'envoi
    const schoolRegistrationData = {
      ...this.registrationForm.basicInfo.value,
      ...this.registrationForm.contactInfo.value,
      facilities: this.facilitiesAndAmenities.value.filter((facility: string | null) => facility && facility.trim() !== ''),
      programs: this.programs.value,
      additionalInfo: this.registrationForm.detailedInfo.get('additionalInfo')?.value
    };


    // Simulation de l'envoi des données (à remplacer par un appel API réel)
    setTimeout(() => {
      this.loading = false;
      this.toastService.success(
        'Demande soumise avec succès',
        'Votre demande d\'enregistrement d\'école a été envoyée. Nous la traiterons dans les plus brefs délais.'
      );
      this.router.navigate(['/'], { fragment: 'school-submitted' });
    }, 1500);

    // Code pour l'appel API réel (à décommenter et adapter)
    /*
    this.schoolService.submitSchoolRegistration(schoolRegistrationData).subscribe({
      next: (response) => {
        this.loading = false;
        this.toastService.success(
          'Demande soumise avec succès',
          'Votre demande d\'enregistrement d\'école a été envoyée. Nous la traiterons dans les plus brefs délais.'
        );
        this.router.navigate(['/'], { fragment: 'school-submitted' });
      },
      error: (err) => {
        this.loading = false;
        console.error('Erreur lors de l\'envoi de la demande:', err);
        this.error = 'Impossible de soumettre votre demande. Veuillez réessayer plus tard.';
      }
    });
    */
  }

  resetForm(): void {
    this.registrationForm.basicInfo.reset();
    this.registrationForm.contactInfo.reset();

    // Réinitialiser les tableaux
    while (this.facilitiesAndAmenities.length > 1) {
      this.facilitiesAndAmenities.removeAt(1);
    }
    this.facilitiesAndAmenities.at(0).setValue('');

    while (this.programs.length > 1) {
      this.programs.removeAt(1);
    }
    (this.programs.at(0) as FormGroup).get('name')?.setValue('');
    (this.programs.at(0) as FormGroup).get('description')?.setValue('');
    (this.programs.at(0) as FormGroup).get('duration')?.setValue('');

    this.registrationForm.detailedInfo.get('additionalInfo')?.setValue('');
    this.registrationForm.termsAgreement.reset();

    this.currentStep = 1;
  }

  // Helpers pour les validations dans le template
  hasError(formGroup: FormGroup, controlName: string, errorType: string): boolean {
    const control = formGroup.get(controlName);
    return control ? control.hasError(errorType) && control.touched : false;
  }

  isProgramInvalid(index: number): boolean {
    const programGroup = this.programs.at(index) as FormGroup;
    return programGroup.invalid && programGroup.touched;
  }

}
