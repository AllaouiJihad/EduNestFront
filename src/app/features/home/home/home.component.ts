import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {Router, RouterModule} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {StarRatingComponent} from "../../school/star-rating/star-rating.component";
import {School} from "../../../core/models/school";
import {Category} from "../../../core/models/category";
import {SchoolService} from "../../../core/services/school.service";
import {finalize, of} from "rxjs";
import {catchError} from "rxjs/operators";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StarRatingComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  featuredSchools: School[] = [];
  categories: Category[] = [];
  searchQuery: string = '';
  searchLocation: string = '';
  selectedCategory: string = '';
  loading: boolean = false;
  error: string | null = null;
  statsCount = {
    schools: 0,
    students: 0,
    parents: 0,
    reviews: 0
  };

  constructor(
    private schoolService: SchoolService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadFeaturedSchools();
    this.loadCategories();
    this.loadStatistics();
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
      finalize(() => this.loading = false),
      catchError(err => {
        this.error = 'Impossible de charger les écoles recommandées. Veuillez réessayer plus tard.';
        console.error('Erreur lors du chargement des écoles en vedette:', err);
        return of({ content: [] });
      })
    ).subscribe(response => {
      this.featuredSchools = response.content;

      // Ajouter une catégorie par défaut si elle n'existe pas
      this.featuredSchools = this.featuredSchools.map(school => {
        if (!school.categoryName) {
          return {
            ...school,
            categoryName: 'École'
          };
        }
        return school;
      });
    });
  }

  loadCategories(): void {
    this.schoolService.getCategories().pipe(
      catchError(err => {
        console.error('Erreur lors du chargement des catégories:', err);
        return of([]);
      })
    ).subscribe(data => {
      this.categories = data;
    });
  }

  loadStatistics(): void {
    // Simuler des statistiques pour la démo
    // Dans un environnement réel, vous appelleriez une API pour obtenir ces données
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
    this.router.navigate(['/schools'], {queryParams});

  }
}
