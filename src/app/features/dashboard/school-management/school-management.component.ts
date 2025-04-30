import {Component, inject, OnInit} from '@angular/core';
import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {PaginationComponent} from "../../../shared/components/pagination/pagination.component";
import {SchoolService} from "../../../core/services/school.service";
import {SchoolSearchResponse} from "../../../core/models/school-search-response";
import {SchoolStatus} from "../../../core/models/school";
import {Page} from "../../../core/models/common.model";

@Component({
  selector: 'app-school-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginationComponent],
  templateUrl: './school-management.component.html',
  styleUrl: './school-management.component.css'
})
export class SchoolManagementComponent implements OnInit{
  private schoolService = inject(SchoolService);

  schools: SchoolSearchResponse[] = [];
  page: number = 0;
  size: number = 10;
  totalItems: number = 0;
  sortBy: string = 'name';
  sortDirection: string = 'asc';

  SchoolStatus = SchoolStatus; // Pour utiliser l'enum dans le template

  searchTerm: string = '';
  selectedStatus: string = '';
  selectedCategory: string = '';

  showDeleteModal: boolean = false;
  schoolToDelete: SchoolSearchResponse | null = null;

  statuses = [
    { value: '', label: 'Tous les statuts' },
    { value: SchoolStatus.PENDING, label: 'En attente' },
    { value: SchoolStatus.REJECTED, label: 'Rejetées' }
  ];

  // Catégories factices (à remplacer par des données réelles)
  categories = [
    { id: '', name: 'Toutes les catégories' },
    { id: '1', name: 'Écoles primaires' },
    { id: '2', name: 'Collèges' },
    { id: '3', name: 'Lycées' },
    { id: '4', name: 'Universités' },
    { id: '5', name: 'Écoles spécialisées' }
  ];

  ngOnInit(): void {
    this.loadSchools();
  }

  loadSchools(): void {
    this.schoolService.getAllSchools(this.page, this.size, this.sortBy, this.sortDirection)
      .subscribe({
        next: (response: Page<SchoolSearchResponse>) => {
          this.schools = response.content;
          this.totalItems = response.totalElements;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des écoles', error);
        }
      });
  }

  onSearch(): void {
    // Implémenter la recherche avec les filtres
    this.page = 0; // Retour à la première page
    this.loadSchools();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadSchools();
  }

  onSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.loadSchools();
  }

  getSortIcon(column: string): string {
    if (this.sortBy !== column) {
      return 'unfold_more';
    }
    return this.sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  confirmDelete(school: SchoolSearchResponse): void {
    this.schoolToDelete = school;
    this.showDeleteModal = true;
  }

  deleteSchool(): void {
    if (!this.schoolToDelete) return;

    this.schoolService.deleteSchool(this.schoolToDelete.id).subscribe({
      next: () => {
        this.schools = this.schools.filter(s => s.id !== this.schoolToDelete!.id);
        this.showDeleteModal = false;
        this.schoolToDelete = null;
        // Recharger la page actuelle si nécessaire
        this.loadSchools();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression de l\'école', error);
        this.showDeleteModal = false;
        this.schoolToDelete = null;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.schoolToDelete = null;
  }

  getStatusClass(status: SchoolStatus): string {
    switch (status) {
      case SchoolStatus.PENDING:
        return 'badge-info';
      case SchoolStatus.REJECTED:
        return 'badge-error';
      default:
        return '';
    }
  }

  getStatusLabel(status: SchoolStatus): string {
    switch (status) {
      case SchoolStatus.PENDING:
        return 'En attente';
      case SchoolStatus.REJECTED:
        return 'Rejetée';
      default:
        return status;
    }
  }

}
