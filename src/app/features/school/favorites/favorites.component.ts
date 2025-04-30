import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {Router, RouterModule} from "@angular/router";
import {StarRatingComponent} from "../star-rating/star-rating.component";
import {FavoriteSchool} from "../../../core/models/favorite-school";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatDividerModule} from "@angular/material/divider";
import {MatChipsModule} from "@angular/material/chips";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {FavoriteService} from "../../../core/services/favorite.service";
import {LoaderComponent} from "../../../shared/components/loader/loader.component";
import {EmptyStateComponent} from "../../../shared/components/empty-state/empty-state.component";
import {NoteDialogComponent} from "./note-dialog/note-dialog.component";
import {ConfirmDialogComponent} from "../../../shared/components/confirm-dialog/confirm-dialog.component";
import {catchError, EMPTY, finalize} from "rxjs";

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    ReactiveFormsModule,
    LoaderComponent,
    EmptyStateComponent,
    StarRatingComponent
  ],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent implements OnInit {
  private favoriteService = inject(FavoriteService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  favorites: FavoriteSchool[] = [];
  filteredFavorites: FavoriteSchool[] = [];
  loading = true;
  searchControl = new FormControl('');

  ngOnInit(): void {
    this.loadFavorites();

    this.searchControl.valueChanges.subscribe(value => {
      this.filterFavorites(value || '');
    });
  }

  loadFavorites(): void {
    this.loading = true;
    this.favoriteService.getFavoriteSchools()
      .pipe(
        catchError(err => {
          this.snackBar.open('Erreur lors du chargement des favoris', 'Fermer', {
            duration: 5000
          });
          console.error('Error loading favorites:', err);
          return EMPTY;
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(favorites => {
        this.favorites = favorites;
        this.filteredFavorites = favorites;
      });
  }

  filterFavorites(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredFavorites = this.favorites;
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    this.filteredFavorites = this.favorites.filter(favorite =>
      favorite.schoolName.toLowerCase().includes(term) ||
      favorite.categoryName.toLowerCase().includes(term) ||
      favorite.city.toLowerCase().includes(term) ||
      (favorite.notes && favorite.notes.toLowerCase().includes(term))
    );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  viewSchool(schoolId: number): void {
    this.router.navigate(['/schools', schoolId]);
  }

  editNotes(favorite: FavoriteSchool): void {
    const dialogRef = this.dialog.open(NoteDialogComponent, {
      width: '400px',
      data: {
        schoolName: favorite.schoolName,
        notes: favorite.notes || ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.loading = true;
        this.favoriteService.addFavoriteSchool(favorite.schoolId, result)
          .pipe(finalize(() => {
            this.loading = false;
            this.loadFavorites();
          }))
          .subscribe(() => {
            this.snackBar.open('Notes mises à jour avec succès', 'Fermer', {
              duration: 3000
            });
          });
      }
    });
  }

  removeFavorite(favorite: FavoriteSchool): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Supprimer des favoris',
        message: `Êtes-vous sûr de vouloir retirer "${favorite.schoolName}" de vos favoris ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.favoriteService.removeFavoriteSchool(favorite.schoolId)
          .pipe(finalize(() => {
            this.loading = false;
            this.loadFavorites();
          }))
          .subscribe(() => {
            this.snackBar.open('Établissement retiré des favoris', 'Fermer', {
              duration: 3000
            });
          });
      }
    });
  }

  navigateToSchoolSearch(): void {
    this.router.navigate(['/schools']);
  }
 }
