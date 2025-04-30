import {Component, inject, OnInit} from '@angular/core';
import {SchoolSearchRequest} from "../../../core/models/school-search-request";
import {Category} from "../../../core/models/category";
import {SchoolService} from "../../../core/services/school.service";
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {Router, RouterModule} from "@angular/router";
import {SchoolCardComponent} from "../../../shared/components/school-card/school-card.component";
import {PaginationComponent} from "../../../shared/components/pagination/pagination.component";
import {SearchFiltersComponent} from "../../../shared/components/search-filters/search-filters.component";
import {Page} from "../../../core/models/common.model";
import {SchoolSearchResponse} from "../../../core/models/school-search-response";
import {CategoryService} from "../../../core/services/category.service";

@Component({
  selector: 'app-school-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SchoolCardComponent,
    PaginationComponent,
    SearchFiltersComponent
  ],
  templateUrl: './school-search.component.html',
  styleUrl: './school-search.component.css'
})
export class SchoolSearchComponent implements OnInit {
  private schoolService = inject(SchoolService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  schools: SchoolSearchResponse[] = [];
  categories: Category[] = [];

  page = 0;
  size = 9;
  totalItems = 0;

  loading = false;
  noResultsFound = false;

  currentFilters: SchoolSearchRequest = {};

  // Villes populaires pour les suggestions rapides
  popularCities = [
    'Paris', 'Lyon', 'Marseille', 'Toulouse',
    'Nice', 'Nantes', 'Strasbourg', 'Montpellier',
    'Bordeaux', 'Lille', 'Rennes', 'Reims'
  ];

  ngOnInit(): void {
    this.loadCategories();
    // Pas de chargement automatique des écoles, attendre que l'utilisateur lance une recherche
  }

  loadCategories(): void {
    this.categoryService.getAllActiveCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des catégories', error);
      }
    });
  }

  onSearch(filters: SchoolSearchRequest): void {
    this.currentFilters = filters;
    this.page = 0;
    this.searchSchools();
  }

  searchSchools(): void {
    this.loading = true;
    this.noResultsFound = false;

    const searchRequest: SchoolSearchRequest = {
      ...this.currentFilters,
      page: this.page,
      size: this.size,
      sortBy: this.currentFilters.sortBy || 'name',
      sortDirection: this.currentFilters.sortDirection || 'asc'
    };

    this.schoolService.searchSchools(searchRequest).subscribe({
      next: (response: Page<SchoolSearchResponse>) => {
        this.schools = response.content;
        this.totalItems = response.totalElements;
        this.noResultsFound = this.schools.length === 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la recherche d\'écoles', error);
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.page = page;
    this.searchSchools();
  }

  quickSearchByCity(city: string): void {
    this.currentFilters = {
      city: city,
      page: 0,
      size: this.size,
      sortBy: 'name',
      sortDirection: 'asc'
    };
    this.searchSchools();
  }

  onFiltersChanged(filters: SchoolSearchRequest): void {
    this.onSearch(filters);
  }
}
