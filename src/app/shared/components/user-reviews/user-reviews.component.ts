import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatDividerModule} from "@angular/material/divider";
import {MatIconModule} from "@angular/material/icon";
import {MatPaginatorModule, PageEvent} from "@angular/material/paginator";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {LoaderComponent} from "../loader/loader.component";
import {EmptyStateComponent} from "../empty-state/empty-state.component";
import {StarRatingComponent} from "../star-rating/star-rating.component";
import {ReviewService} from "../../../core/services/review.service";
import {Router} from "@angular/router";
import {Review} from "../../../core/models/review";
import {Page} from "../../../core/models/common.model";
import {catchError, EMPTY, finalize} from "rxjs";
import {ConfirmDialogComponent} from "../confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-user-reviews',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatDialogModule,
    LoaderComponent,
    EmptyStateComponent,
    StarRatingComponent
  ],
  templateUrl: './user-reviews.component.html',
  styleUrl: './user-reviews.component.css'
})
export class UserReviewsComponent implements OnInit{
  private reviewService = inject(ReviewService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  reviewsPage: Page<Review> | null = null;
  loading = true;
  currentPage = 0;
  pageSize = 10;

  // Mapping d'ID d'école à nom d'école (à implémenter avec un vrai service)
  private schoolsMap: Record<number, string> = {};

  ngOnInit(): void {
    this.loadReviews(this.currentPage, this.pageSize);
  }

  loadReviews(page: number, size: number): void {
    this.loading = true;
    this.reviewService.getMyReviews(page, size)
      .pipe(
        catchError(err => {
          this.snackBar.open('Erreur lors du chargement des avis', 'Fermer', {
            duration: 5000
          });
          console.error('Error loading reviews:', err);
          return EMPTY;
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(reviewsPage => {
        this.reviewsPage = reviewsPage;
        // Ici, vous pourriez charger les noms des écoles correspondant aux IDs
      });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getSchoolName(review: Review): string {
    // Dans une vraie implémentation, cette méthode utiliserait un service ou
    // des données pré-chargées pour récupérer le nom de l'école à partir de son ID
    return this.schoolsMap[review.schoolId] || `École #${review.schoolId}`;
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadReviews(this.currentPage, this.pageSize);
  }

  editReview(review: Review): void {
    // Redirection vers une page d'édition, ou ouverture d'un dialogue d'édition
    // À implémenter selon les besoins
    this.router.navigate(['/schools', review.schoolId], { queryParams: { editReview: review.id } });
  }

  deleteReview(review: Review): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Supprimer cet avis',
        message: 'Êtes-vous sûr de vouloir supprimer cet avis ? Cette action est irréversible.',
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.reviewService.deleteReview(review.id)
          .pipe(finalize(() => {
            this.loading = false;
            this.loadReviews(this.currentPage, this.pageSize);
          }))
          .subscribe(() => {
            this.snackBar.open('Avis supprimé avec succès', 'Fermer', {
              duration: 3000
            });
          });
      }
    });
  }

  viewSchool(schoolId: number): void {
    this.router.navigate(['/schools', schoolId]);
  }

  navigateToSchools(): void {
    this.router.navigate(['/schools']);
  }

}
