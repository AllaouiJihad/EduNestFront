import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage: number = 0;
  @Input() pageSize: number = 10;
  @Input() totalItems: number = 0;

  @Output() pageChange = new EventEmitter<number>();

  totalPages: number = 0;
  visiblePages: number[] = [];
  Math = Math;

  ngOnChanges(): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.calculateVisiblePages();
  }

  calculateVisiblePages(): void {
    const maxVisiblePages = 5;
    this.visiblePages = [];

    if (this.totalPages <= maxVisiblePages) {
      // Si on a peu de pages, on les affiche toutes
      for (let i = 0; i < this.totalPages; i++) {
        this.visiblePages.push(i);
      }
    } else {
      // Sinon on affiche un sous-ensemble avec des ellipses
      // Toujours montrer la première page
      this.visiblePages.push(0);

      // Calculer les pages à afficher autour de la page courante
      let startPage = Math.max(1, this.currentPage - 1);
      let endPage = Math.min(this.totalPages - 2, this.currentPage + 1);

      // Ajouter une ellipse si nécessaire
      if (startPage > 1) {
        this.visiblePages.push(-1); // -1 pour indiquer une ellipse
      }

      // Ajouter les pages autour de la page courante
      for (let i = startPage; i <= endPage; i++) {
        this.visiblePages.push(i);
      }

      // Ajouter une ellipse si nécessaire
      if (endPage < this.totalPages - 2) {
        this.visiblePages.push(-1); // -1 pour indiquer une ellipse
      }

      // Toujours montrer la dernière page
      this.visiblePages.push(this.totalPages - 1);
    }
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.pageChange.emit(page);
    }
  }
}
