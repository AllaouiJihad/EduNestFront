import { Component, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { StarRatingComponent } from "../../school/star-rating/star-rating.component";
import { School } from "../../../core/models/school";
import { Category } from "../../../core/models/category";
import { SchoolService } from "../../../core/services/school.service";
import { Router } from '@angular/router';
import { finalize, catchError, tap, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import {NavbarComponent} from "../../../shared/components/navbar/navbar.component";
import {FooterComponent} from "../../../shared/components/footer/footer.component";
import {AuthService} from "../../../core/services/auth.service";
import {ErrorAlertComponent} from "../../../shared/components/error-alert/error-alert.component";
import {LoadingSpinnerComponent} from "../../../shared/components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    StarRatingComponent,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  featuredSchools: School[] = [];
  categories: Category[] = [];
  searchQuery: string = '';
  searchLocation: string = '';
  selectedCategory: string = '';
  loading: boolean = false;
  error: string | null = null;
  isAuthenticated: boolean = false;

  statsCount = {
    schools: 0,
    students: 0,
    parents: 0,
    reviews: 0
  };

  // Données de secours pour les écoles en cas d'erreur de chargement
  fallbackSchools: School[] = [
    {
      id: 1,
      name: 'École Supérieure de Paris',
      city: 'Paris',
      postalCode: '75001',
      averageRating: 4.5,
      reviewCount: 120,
      categoryName: 'Université',
      imageUrl: null
    },
    {
      id: 2,
      name: 'Lycée International de Lyon',
      city: 'Lyon',
      postalCode: '69002',
      averageRating: 4.3,
      reviewCount: 85,
      categoryName: 'Lycée',
      imageUrl: null
    },
    {
      id: 3,
      name: 'Institut Technologique de Marseille',
      city: 'Marseille',
      postalCode: '13008',
      averageRating: 4.1,
      reviewCount: 65,
      categoryName: 'Institut',
      imageUrl: null
    }
  ];

  // Catégories de secours
  fallbackCategories: Category[] = [
    { id: "1", name: 'Université' },
    { id: "2", name: 'Lycée' },
    { id: "3", name: 'Collège' },
    { id: "4", name: 'École primaire' },
    { id: "5", name: 'École maternelle' }
  ];

  constructor(
    private schoolService: SchoolService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadFeaturedSchools();
    this.loadCategories();
    this.loadStatistics();
    this.checkAuthentication();
  }

  checkAuthentication(): void {
    this.authService.isAuthenticated$.subscribe(
      isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
      }
    );
  }

  loadFeaturedSchools(): void {
    this.loading = true;
    this.error = null;

    this.schoolService.searchSchools({
      page: 0,
      size: 6,
      sortBy: 'averageRating',
      sortDirection: 'desc'
    }).pipe(
      map((response: any) => {
        // Traiter différents formats de réponse
        if (Array.isArray(response)) {
          return { content: response };
        }
        if (response && response.content === undefined) {
          console.warn('Format de réponse inattendu', response);
          return { content: [] };
        }
        return response;
      }),
      finalize(() => this.loading = false),
      catchError((err: HttpErrorResponse) => {
        this.handleSchoolLoadingError('Impossible de charger les écoles recommandées.');
        console.error('Erreur lors du chargement des écoles en vedette:', err);
        return of({ content: this.fallbackSchools });
      })
    ).subscribe((response: any) => {
      if (response && response.content) {
        this.featuredSchools = response.content.map((school: School) => ({
          ...school,
          categoryName: school.categoryName || 'École'
        }));
      } else {
        this.handleSchoolLoadingError('Format de réponse invalide.');
      }
    });
  }


  private handleSchoolLoadingError(message: string): void {
    this.error = message;
    this.loading = false;
    this.featuredSchools = this.fallbackSchools;
  }

  loadCategories(): void {
    this.schoolService.getCategories().pipe(
      map((response: any) => {
        // Traiter différents formats de réponse
        if (response && !Array.isArray(response)) {
          if (response.content && Array.isArray(response.content)) {
            return response.content;
          }
          return [];
        }
        return response;
      }),
      catchError(err => {
        console.error('Erreur lors du chargement des catégories:', err);
        return of(this.fallbackCategories);
      })
    ).subscribe((data: any) => {
      if (Array.isArray(data)) {
        this.categories = data.map(category => ({
          ...category,
          id: typeof category.id === 'number' ? String(category.id) : category.id
        }));
      } else {
        this.categories = this.fallbackCategories;
      }
    });
  }

  loadStatistics(): void {
    this.statsCount = {
      schools: 1500,
      students: 25000,
      parents: 15000,
      reviews: 7800
    };
  }

  handleSearch(): void {
    const queryParams: any = {};

    if (this.searchQuery) {
      queryParams.name = this.searchQuery;
    }

    if (this.searchLocation) {
      queryParams.city = this.searchLocation;
    }

    if (this.selectedCategory) {
      queryParams.categoryId = this.selectedCategory;
    }

    // Navigation vers la page de recherche avec les paramètres
    this.router.navigate(['/schools'], { queryParams });
  }
  addToFavorites(school: School, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }

    this.schoolService.addToFavorites(school.id).subscribe(
      () => {
        // Afficher notification de succès
        alert(`${school.name} a été ajouté à vos favoris.`);
      },
      (error) => {
        console.error('Erreur lors de l\'ajout aux favoris:', error);
        // Afficher message d'erreur
        alert('Erreur: Impossible d\'ajouter l\'école aux favoris.');
      }
    );
  }
}
