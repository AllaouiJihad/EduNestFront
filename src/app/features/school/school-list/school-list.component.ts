import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {ActivatedRoute, Router, RouterModule} from "@angular/router";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NavbarComponent} from "../../../shared/components/navbar/navbar.component";
import {FooterComponent} from "../../../shared/components/footer/footer.component";
import {LoadingSpinnerComponent} from "../../../shared/components/loading-spinner/loading-spinner.component";
import {ErrorAlertComponent} from "../../../shared/components/error-alert/error-alert.component";
import {StarRatingComponent} from "../star-rating/star-rating.component";
import {School} from "../../../core/models/school";
import {Category} from "../../../core/models/category";
import {SchoolService} from "../../../core/services/school.service";
import {AuthService} from "../../../core/services/auth.service";
import {ToastService} from "../../../core/services/toast.service";
import {finalize} from "rxjs";
import {SearchResponse} from "../../../core/models/search-response";
import {SchoolSearchRequest} from "../../../core/models/school-search-request";

@Component({
  selector: 'app-school-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NavbarComponent,
    FooterComponent,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
    StarRatingComponent
  ],
  templateUrl: './school-list.component.html',
  styleUrl: './school-list.component.css'
})
export class SchoolListComponent implements OnInit {
  schools: School[] = [];
  categories: Category[] = [];
  loading: boolean = false;
  error: string | null = null;
  isAuthenticated: boolean = false;

  // Pagination
  currentPage: number = 0;
  pageSize: number = 12;
  totalElements: number = 0;
  totalPages: number = 0;

  // Filtres de recherche
  searchForm = new FormGroup({
    name: new FormControl(''),
    city: new FormControl(''),
    postalCode: new FormControl(''),
    categoryId: new FormControl('')
  });

  // Tri
  sortOptions = [
    { value: 'name,asc', label: 'Nom (A-Z)' },
    { value: 'name,desc', label: 'Nom (Z-A)' },
    { value: 'averageRating,desc', label: 'Note (la plus haute)' },
    { value: 'averageRating,asc', label: 'Note (la plus basse)' },
    { value: 'reviewCount,desc', label: 'Nombre d\'avis (le plus élevé)' },
    { value: 'city,asc', label: 'Ville (A-Z)' }
  ];
  currentSort: string = 'name,asc';

  constructor(
    private schoolService: SchoolService,
    private authService: AuthService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.checkAuthentication();
    this.initializeFromQueryParams();
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  checkAuthentication(): void {
    this.authService.isAuthenticated$.subscribe(
      isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
      }
    );
  }

  /**
   * Charge la liste des catégories
   */
  loadCategories(): void {
    this.schoolService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des catégories:', err);
      }
    });
  }

  /**
   * Initialise les filtres à partir des paramètres d'URL
   */
  initializeFromQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      // Récupérer les filtres depuis l'URL
      const name = params['name'] || '';
      const city = params['city'] || '';
      const postalCode = params['postalCode'] || '';
      const categoryId = params['categoryId'] || '';
      const page = params['page'] ? parseInt(params['page']) : 0;
      const sort = params['sort'] || 'name,asc';

      // Mettre à jour le formulaire
      this.searchForm.patchValue({
        name,
        city,
        postalCode,
        categoryId
      });

      // Mettre à jour les variables de pagination et de tri
      this.currentPage = page;
      this.currentSort = sort;

      // Charger les écoles avec ces filtres
      this.searchSchools();
    });
  }

  /**
   * Recherche les écoles selon les filtres
   */
  searchSchools(): void {
    this.loading = true;
    this.error = null;

    // Récupérer les valeurs du formulaire et les convertir au bon type
    const formValues = this.searchForm.value;

    // Extraire les valeurs de tri
    const [sortBy, sortDirection] = this.currentSort.split(',');

    // Préparer la requête avec le bon typage
    const searchRequest: SchoolSearchRequest = {
      name: formValues.name ?? undefined,
      city: formValues.city ?? undefined,
      postalCode: formValues.postalCode ?? undefined,
      categoryId: formValues.categoryId ? parseInt(formValues.categoryId) : undefined,
      page: this.currentPage,
      size: this.pageSize,
      sortBy,
      sortDirection
    };

    // Mettre à jour l'URL avec les paramètres de recherche
    this.updateUrlWithParams();

    // Effectuer la recherche
    this.schoolService.searchSchools(searchRequest).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (response: SearchResponse<School>) => {
        // Le reste de votre code reste inchangé
      },
      error: (err) => {
        // Le reste de votre code reste inchangé
      }
    });
  }

  /**
   * Met à jour l'URL avec les paramètres de recherche
   */
  updateUrlWithParams(): void {
    const { name, city, postalCode, categoryId } = this.searchForm.value;

    const queryParams: any = {
      page: this.currentPage,
      sort: this.currentSort
    };

    if (name) queryParams.name = name;
    if (city) queryParams.city = city;
    if (postalCode) queryParams.postalCode = postalCode;
    if (categoryId) queryParams.categoryId = categoryId;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  /**
   * Réinitialise les filtres
   */
  resetFilters(): void {
    this.searchForm.reset();
    this.currentPage = 0;
    this.currentSort = 'name,asc';
    this.updateUrlWithParams();
    this.searchSchools();
  }

  /**
   * Change la page
   */
  setPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.searchSchools();
    }
  }

  /**
   * Change le tri
   */
  setSorting(sort: string): void {
    this.currentSort = sort;
    this.currentPage = 0;
    this.searchSchools();
  }

  /**
   * Génère un tableau de numéros de page à afficher
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];

    // Afficher au maximum 5 pages
    const maxPages = 5;

    // Déterminer le point de départ
    let startPage = Math.max(0, this.currentPage - Math.floor(maxPages / 2));
    const endPage = Math.min(this.totalPages - 1, startPage + maxPages - 1);

    // Ajuster le point de départ si nécessaire
    startPage = Math.max(0, endPage - maxPages + 1);

    // Générer les numéros de page
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Ajoute une école aux favoris
   */
  addToFavorites(school: School, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.isAuthenticated) {
      this.toastService.error('Authentification requise', 'Veuillez vous connecter pour ajouter des écoles à vos favoris.');
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }

    this.schoolService.addToFavorites(school.id).subscribe({
      next: () => {
        this.toastService.success('École ajoutée', `${school.name} a été ajoutée à vos favoris.`);
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout aux favoris:', err);
        this.toastService.error('Erreur', 'Impossible d\'ajouter l\'école à vos favoris.');
      }
    });
  }

  /**
   * Formate une adresse
   */
  formatLocation(school: School): string {
    if (school.city && school.postalCode) {
      return `${school.city} (${school.postalCode})`;
    } else if (school.city) {
      return school.city;
    } else if (school.postalCode) {
      return school.postalCode;
    }
    return 'Lieu non renseigné';
  }

  /**
   * Vérifie si un filtre est actif
   */
  hasActiveFilters(): boolean {
    const { name, city, postalCode, categoryId } = this.searchForm.value;
    return !!(name || city || postalCode || categoryId);
  }

}
