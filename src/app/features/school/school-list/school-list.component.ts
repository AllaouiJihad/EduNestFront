import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import { RouterModule} from "@angular/router";
import { FormsModule} from "@angular/forms";
import {SchoolCardComponent} from "../../../shared/components/school-card/school-card.component";
import {PaginationComponent} from "../../../shared/components/pagination/pagination.component";
import {SchoolSearchResponse} from "../../../core/models/school-search-response";
import {Page} from "../../../core/models/common.model";
import {Category} from "../../../core/models/category";
import {SchoolService} from "../../../core/services/school.service";
import {CategoryService} from "../../../core/services/category.service";

@Component({
  selector: 'app-school-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SchoolCardComponent,
    PaginationComponent
  ],
  templateUrl: './school-list.component.html',
  styleUrl: './school-list.component.css'
})
export class SchoolListComponent implements OnInit {
  private schoolService = inject(SchoolService);
  private categoryService = inject(CategoryService);

  schools: SchoolSearchResponse[] = [];
  categories: Category[] = [];
  selectedCategory: number | null = null;

  page = 0;
  size = 9;
  totalItems = 0;
  sortBy = 'name';
  sortDirection = 'asc';

  loading = true;

  ngOnInit(): void {
    this.loadCategories();
    this.loadSchools();
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

  loadSchools(): void {
    this.loading = true;
    this.schoolService.getAllSchools(this.page, this.size, this.sortBy, this.sortDirection).subscribe({
      next: (response: Page<SchoolSearchResponse>) => {
        this.schools = response.content;
        this.totalItems = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des écoles', error);
        this.loading = false;
      }
    });
  }

  onCategoryChange(): void {
    this.page = 0;
    if (this.selectedCategory) {
      this.loading = true;
      this.schoolService.getSchoolsByCategory(this.selectedCategory, this.page, this.size).subscribe({
        next: (response: Page<SchoolSearchResponse>) => {
          this.schools = response.content;
          this.totalItems = response.totalElements;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des écoles par catégorie', error);
          this.loading = false;
        }
      });
    } else {
      this.loadSchools();
    }
  }

  onPageChange(page: number): void {
    this.page = page;
    if (this.selectedCategory) {
      this.schoolService.getSchoolsByCategory(this.selectedCategory, this.page, this.size).subscribe({
        next: (response: Page<SchoolSearchResponse>) => {
          this.schools = response.content;
          this.totalItems = response.totalElements;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des écoles par catégorie', error);
        }
      });
    } else {
      this.loadSchools();
    }
  }

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;

    switch (value) {
      case 'name_asc':
        this.sortBy = 'name';
        this.sortDirection = 'asc';
        break;
      case 'name_desc':
        this.sortBy = 'name';
        this.sortDirection = 'desc';
        break;
      case 'rating_desc':
        this.sortBy = 'averageRating';
        this.sortDirection = 'desc';
        break;
      case 'rating_asc':
        this.sortBy = 'averageRating';
        this.sortDirection = 'asc';
        break;
      default:
        this.sortBy = 'name';
        this.sortDirection = 'asc';
    }

    this.page = 0;
    this.loadSchools();
  }
}
