import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CategoryService} from "../../../core/services/category.service";
import {SchoolSearchRequest} from "../../../core/models/school-search-request";
import {Category} from "../../../core/models/category";

@Component({
  selector: 'app-search-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './search-filters.component.html',
  styleUrl: './search-filters.component.css'
})
export class SearchFiltersComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);

  @Input() initialFilters?: SchoolSearchRequest;
  @Output() filtersChanged = new EventEmitter<SchoolSearchRequest>();

  searchForm!: FormGroup;
  categories: Category[] = [];

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  private initForm(): void {
    this.searchForm = this.fb.group({
      name: [this.initialFilters?.name || ''],
      city: [this.initialFilters?.city || ''],
      postalCode: [this.initialFilters?.postalCode || ''],
      categoryId: [this.initialFilters?.categoryId || null],
      minRating: [this.initialFilters?.minRating || 0],
    });

    // Écouter les changements pour une recherche dynamique si nécessaire
    // this.searchForm.valueChanges.subscribe(() => this.onSubmit());
  }

  private loadCategories(): void {
    this.categoryService.getAllActiveCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des catégories', error);
      }
    });
  }

  onSubmit(): void {
    const filters: SchoolSearchRequest = {
      ...this.searchForm.value,
      page: 0, // Reset page to first page on filter change
    };

    // Enlever les filtres vides
    Object.keys(filters).forEach(key => {
      // @ts-ignore
      if (filters[key] === '' || filters[key] === null) {
        // @ts-ignore
        delete filters[key];
      }
    });

    this.filtersChanged.emit(filters);
  }

  resetFilters(): void {
    this.searchForm.reset({
      name: '',
      city: '',
      postalCode: '',
      categoryId: null,
      minRating: 0,
    });
    this.onSubmit();
  }
}
