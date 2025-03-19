import {Component, OnInit} from '@angular/core';
import {SchoolSearchRequest} from "../../../core/models/school-search-request";
import {SearchResponse} from "../../../core/models/search-response";
import {School} from "../../../core/models/school";
import {Category} from "../../../core/models/category";
import {SchoolService} from "../../../core/services/school.service";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {StarRatingComponent} from "../star-rating/star-rating.component";

@Component({
  selector: 'app-school-search',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, StarRatingComponent
  ],
  templateUrl: './school-search.component.html',
  styleUrl: './school-search.component.css'
})
export class SchoolSearchComponent implements OnInit {
  searchParams: SchoolSearchRequest = {
    name: '',
    city: '',
    postalCode: '',
    page: 0,
    size: 10,
    sortBy: 'name',
    sortDirection: 'asc'
  };
  results: SearchResponse<School> = {
    content: [],
    pageable: { pageNumber: 0, pageSize: 10, sort: { sorted: false } },
    totalElements: 0,
    totalPages: 0,
    last: true,
    first: true,
    size: 10,
    number: 0,
    numberOfElements: 0,
    empty: true
  };

  categories: Category[] = [];
  loading = false;
  error: string | null = null;

  constructor(private schoolService: SchoolService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.schoolService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des catégories:', err);
        this.error = 'Impossible de charger les catégories. Veuillez réessayer plus tard.';
      }
    });
  }

  searchSchools(page: number = 0): void {
    this.loading = true;
    this.error = null;

    this.schoolService.searchSchools({ ...this.searchParams, page }).subscribe({
      next: (data) => {
        this.results = data;
        this.searchParams.page = page;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la recherche d\'écoles:', err);
        this.error = 'Une erreur est survenue lors de la recherche. Veuillez réessayer plus tard.';
        this.loading = false;
      }
    });
  }

  handleSubmit(): void {
    this.searchParams.page = 0;
    this.searchSchools();
  }

  handlePageChange(newPage: number): void {
    this.searchSchools(newPage);
  }

  handleSort(sortBy: string): void {
    if (this.searchParams.sortBy === sortBy) {
      this.searchParams.sortDirection = this.searchParams.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.searchParams.sortBy = sortBy;
      this.searchParams.sortDirection = 'asc';
    }

    this.searchParams.page = 0;
    this.searchSchools();
  }

  addToFavorites(schoolId: number): void {
    this.schoolService.addToFavorites(schoolId).subscribe({
      next: () => {
        alert('École ajoutée aux favoris !');
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout aux favoris:', err);
        alert('Impossible d\'ajouter cette école aux favoris. Veuillez réessayer.');
      }
    });
  }

}
