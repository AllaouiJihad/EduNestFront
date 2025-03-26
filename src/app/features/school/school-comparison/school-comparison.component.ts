import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {ActivatedRoute, Router, RouterModule} from "@angular/router";
import {StarRatingComponent} from "../star-rating/star-rating.component";
import {FavoriteSchool} from "../../../core/models/favorite-school";
import {SchoolComparisonResponse} from "../../../core/models/school-comparison-response";
import {SchoolService} from "../../../core/services/school.service";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NavbarComponent} from "../../../shared/components/navbar/navbar.component";
import {FooterComponent} from "../../../shared/components/footer/footer.component";
import {LoadingSpinnerComponent} from "../../../shared/components/loading-spinner/loading-spinner.component";
import {ErrorAlertComponent} from "../../../shared/components/error-alert/error-alert.component";
import {finalize, forkJoin, of, switchMap} from "rxjs";
import {School} from "../../../core/models/school";
import {SchoolDetails} from "../../../core/models/school-details";
import {ToastService} from "../../../core/services/toast.service";
import {catchError} from "rxjs/operators";

@Component({
  selector: 'app-school-comparison',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NavbarComponent,
    FooterComponent,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
    StarRatingComponent
  ],
  templateUrl: './school-comparison.component.html',
  styleUrl: './school-comparison.component.css'
})
export class SchoolComparisonComponent implements OnInit{
  loading: boolean = false;
  error: string | null = null;
  schools: School[] = [];
  selectedSchools: SchoolDetails[] = [];
  comparisonData: SchoolComparisonResponse | null = null;
  maxSchoolsToCompare: number = 3;

  searchForm = new FormGroup({
    searchQuery: new FormControl('', [Validators.required])
  });

  searchResults: School[] = [];
  searchLoading: boolean = false;

  constructor(
    private schoolService: SchoolService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.checkUrlParams();
    this.loadPopularSchools();
  }

  /**
   * Vérifie si des IDs d'écoles sont présents dans l'URL
   */
  checkUrlParams(): void {
    this.route.queryParams.subscribe(params => {
      const schoolIds = params['ids'];
      if (schoolIds) {
        const ids = schoolIds.split(',').map((id: string) => parseInt(id, 10));
        if (ids.length > 0) {
          this.loadSchoolsForComparison(ids);
        }
      }
    });
  }

  /**
   * Charge une liste d'écoles populaires pour suggestion
   */
  loadPopularSchools(): void {
    this.loading = true;

    this.schoolService.searchSchools({
      page: 0,
      size: 10,
      sortBy: 'averageRating',
      sortDirection: 'desc'
    }).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (response) => {
        this.schools = response.content;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des écoles populaires:', err);
        this.error = 'Impossible de charger les écoles populaires. Veuillez réessayer plus tard.';
      }
    });
  }

  /**
   * Recherche des écoles selon le terme de recherche
   */
  searchSchools(): void {
    if (this.searchForm.invalid) {
      return;
    }

    const query = this.searchForm.get('searchQuery')?.value;
    if (!query) return;

    this.searchLoading = true;

    this.schoolService.searchSchools({
      name: query,
      page: 0,
      size: 5
    }).pipe(
      finalize(() => this.searchLoading = false)
    ).subscribe({
      next: (response) => {
        this.searchResults = response.content;
        if (this.searchResults.length === 0) {
          this.toastService.info('Aucun résultat', `Aucune école trouvée pour "${query}"`);
        }
      },
      error: (err) => {
        console.error('Erreur lors de la recherche:', err);
        this.toastService.error('Erreur de recherche', 'Impossible de rechercher des écoles. Veuillez réessayer.');
      }
    });
  }

  /**
   * Charge les détails des écoles pour comparaison
   */
  loadSchoolsForComparison(schoolIds: number[]): void {
    this.loading = true;
    this.error = null;

    // Tableau d'observables pour chaque école
    const schoolRequests = schoolIds.map(id =>
      this.schoolService.getSchoolDetails(id).pipe(
        catchError(err => {
          console.error(`Erreur lors du chargement de l'école ID ${id}:`, err);
          return of(null);
        })
      )
    );

    // Exécuter toutes les requêtes en parallèle
    forkJoin(schoolRequests).pipe(
      switchMap(schools => {
        // Filtrer les écoles nulles (en cas d'erreur)
        const validSchools = schools.filter(school => school !== null) as SchoolDetails[];
        this.selectedSchools = validSchools;

        if (validSchools.length < 2) {
          this.error = 'Au moins deux écoles sont nécessaires pour faire une comparaison.';
          return of(null);
        }

        // Charger les données de comparaison
        return this.schoolService.compareSchools({
          schoolIds: validSchools.map(school => school.id)
        }).pipe(
          catchError(err => {
            console.error('Erreur lors de la comparaison des écoles:', err);
            this.error = 'Impossible de générer la comparaison. Veuillez réessayer plus tard.';
            return of(null);
          })
        );
      }),
      finalize(() => this.loading = false)
    ).subscribe({
      next: (response) => {
        if (response) {
          this.comparisonData = response;
        }
      }
    });
  }

  /**
   * Ajoute une école à la comparaison
   */
  addSchoolToComparison(school: School): void {
    if (this.isSchoolSelected(school.id)) {
      this.toastService.info('École déjà sélectionnée', `${school.name} est déjà dans votre comparaison.`);
      return;
    }

    if (this.selectedSchools.length >= this.maxSchoolsToCompare) {
      this.toastService.warning(
        'Maximum atteint',
        `Vous ne pouvez comparer que ${this.maxSchoolsToCompare} écoles à la fois. Veuillez en retirer une avant d'en ajouter une nouvelle.`
      );
      return;
    }

    this.loading = true;

    this.schoolService.getSchoolDetails(school.id).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (schoolDetails) => {
        this.selectedSchools.push(schoolDetails);
        this.toastService.success('École ajoutée', `${school.name} a été ajoutée à votre comparaison.`);

        if (this.selectedSchools.length >= 2) {
          this.updateComparisonData();
        }

        // Mettre à jour l'URL
        this.updateUrlWithSelectedSchools();

        // Effacer les résultats de recherche
        this.searchResults = [];
        this.searchForm.get('searchQuery')?.setValue('');
      },
      error: (err) => {
        console.error(`Erreur lors du chargement des détails de l'école ID ${school.id}:`, err);
        this.toastService.error(
          'Erreur',
          `Impossible de charger les détails de l'école. Veuillez réessayer.`
        );
      }
    });
  }

  /**
   * Retire une école de la comparaison
   */
  removeSchoolFromComparison(schoolId: number): void {
    const index = this.selectedSchools.findIndex(school => school.id === schoolId);
    if (index !== -1) {
      const schoolName = this.selectedSchools[index].name;
      this.selectedSchools.splice(index, 1);
      this.toastService.info('École retirée', `${schoolName} a été retirée de votre comparaison.`);

      // Mettre à jour l'URL
      this.updateUrlWithSelectedSchools();

      if (this.selectedSchools.length >= 2) {
        this.updateComparisonData();
      } else {
        this.comparisonData = null;
      }
    }
  }

  /**
   * Met à jour les données de comparaison
   */
  updateComparisonData(): void {
    if (this.selectedSchools.length < 2) {
      return;
    }

    this.loading = true;

    this.schoolService.compareSchools({
      schoolIds: this.selectedSchools.map(school => school.id)
    }).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (response) => {
        this.comparisonData = response;
      },
      error: (err) => {
        console.error('Erreur lors de la comparaison des écoles:', err);
        this.toastService.error(
          'Erreur de comparaison',
          'Impossible de générer la comparaison. Veuillez réessayer plus tard.'
        );
      }
    });
  }

  /**
   * Vérifie si une école est déjà sélectionnée
   */
  isSchoolSelected(schoolId: number): boolean {
    return this.selectedSchools.some(school => school.id === schoolId);
  }

  /**
   * Génère un lien partageable pour la comparaison actuelle
   */
  generateShareLink(): string {
    const baseUrl = window.location.origin;
    const ids = this.selectedSchools.map(school => school.id).join(',');
    return `${baseUrl}/compare?ids=${ids}`;
  }

  /**
   * Copie le lien de partage dans le presse-papiers
   */
  copyShareLink(): void {
    const link = this.generateShareLink();

    navigator.clipboard.writeText(link).then(
      () => {
        this.toastService.success('Lien copié', 'Le lien de comparaison a été copié dans le presse-papiers.');
      },
      (err) => {
        console.error('Erreur lors de la copie du lien:', err);
        this.toastService.error('Erreur', 'Impossible de copier le lien. Veuillez réessayer.');
      }
    );
  }

  /**
   * Met à jour l'URL avec les écoles sélectionnées
   */
  updateUrlWithSelectedSchools(): void {
    if (this.selectedSchools.length > 0) {
      const ids = this.selectedSchools.map(school => school.id).join(',');
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { ids },
        queryParamsHandling: 'merge'
      });
    } else {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { ids: null },
        queryParamsHandling: 'merge'
      });
    }
  }

  /**
   * Retourne un critère formaté pour l'affichage
   */

  formatCriterion(criterion: string): string {
    // Transformer snake_case ou camelCase en texte lisible
    return criterion
      .replace(/([A-Z])/g, ' $1') // Insérer un espace avant les majuscules
      .replace(/_/g, ' ') // Remplacer les underscores par des espaces
      .replace(/^\w/, c => c.toUpperCase()); // Majuscule pour la première lettre
  }
  /**
   * Réinitialise la comparaison
   */
  resetComparison(): void {
    this.selectedSchools = [];
    this.comparisonData = null;
    this.updateUrlWithSelectedSchools();
    this.toastService.info('Comparaison réinitialisée', 'Toutes les écoles ont été retirées de la comparaison.');
  }

  getMatrixCategories(): string[] {
    if (!this.comparisonData || !this.comparisonData.comparisonMatrix) return [];
    return Object.keys(this.comparisonData.comparisonMatrix);
  }


}
