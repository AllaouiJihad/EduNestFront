import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {PaginationComponent} from "../../../shared/components/pagination/pagination.component";
import {Category} from "../../../core/models/category";
import {CategoryService} from "../../../core/services/category.service";

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PaginationComponent],
  templateUrl: './category-management.component.html',
  styleUrl: './category-management.component.css'
})
export class CategoryManagementComponent implements OnInit{
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  categories: Category[] = [];
  page: number = 0;
  size: number = 10;
  totalItems: number = 0;
  sortBy: string = 'name';
  sortDir: string = 'asc';

  showAddModal: boolean = false;
  showEditModal: boolean = false;
  showDeleteModal: boolean = false;

  categoryForm: FormGroup = this.fb.group({
    id: [null],
    name: ['', [Validators.required, Validators.maxLength(100)]],
    type: ['', [Validators.required, Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(500)]],
    active: [true]
  });

  selectedCategory: Category | null = null;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories(this.page, this.size, this.sortBy, this.sortDir).subscribe({
      next: (response) => {
        this.categories = response.content;
        this.totalItems = response.totalElements;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des catégories', error);
      }
    });
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadCategories();
  }

  onSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDir = 'asc';
    }
    this.loadCategories();
  }

  getSortIcon(column: string): string {
    if (this.sortBy !== column) {
      return 'unfold_more';
    }
    return this.sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  openAddModal(): void {
    this.categoryForm.reset({ active: true });
    this.showAddModal = true;
  }

  openEditModal(category: Category): void {
    this.selectedCategory = category;
    this.categoryForm.patchValue({
      id: category.id,
      name: category.name,
      type: category.type,
      description: category.description,
      active: category.active
    });
    this.showEditModal = true;
  }

  openDeleteModal(category: Category): void {
    this.selectedCategory = category;
    this.showDeleteModal = true;
  }

  toggleCategoryStatus(category: Category): void {
    this.categoryService.toggleCategoryStatus(category.id, !category.active).subscribe({
      next: (updatedCategory) => {
        const index = this.categories.findIndex(c => c.id === category.id);
        if (index !== -1) {
          this.categories[index] = updatedCategory;
        }
      },
      error: (error) => {
        console.error('Erreur lors de la modification du statut de la catégorie', error);
      }
    });
  }

  submitCategoryForm(): void {
    if (this.categoryForm.invalid) return;

    const categoryData = this.categoryForm.value;
    const isNewCategory = !categoryData.id;

    if (isNewCategory) {
      // Créer une nouvelle catégorie
      this.categoryService.createCategory(categoryData).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModals();
        },
        error: (error) => {
          console.error('Erreur lors de la création de la catégorie', error);
        }
      });
    } else {
      // Mettre à jour une catégorie existante
      this.categoryService.updateCategory(categoryData.id, categoryData).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModals();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour de la catégorie', error);
        }
      });
    }
  }

  deleteCategory(): void {
    if (!this.selectedCategory) return;

    this.categoryService.deleteCategory(this.selectedCategory.id).subscribe({
      next: () => {
        this.loadCategories();
        this.closeModals();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression de la catégorie', error);
      }
    });
  }

  closeModals(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedCategory = null;
    this.categoryForm.reset({ active: true });
  }
}
