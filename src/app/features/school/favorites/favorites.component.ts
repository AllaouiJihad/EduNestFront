import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {NavbarComponent} from "../../../shared/components/navbar/navbar.component";
import {FooterComponent} from "../../../shared/components/footer/footer.component";
import {LoadingSpinnerComponent} from "../../../shared/components/loading-spinner/loading-spinner.component";
import {ErrorAlertComponent} from "../../../shared/components/error-alert/error-alert.component";
import {StarRatingComponent} from "../star-rating/star-rating.component";
import {finalize} from "rxjs";
import {SchoolService} from "../../../core/services/school.service";
import {FavoriteSchool} from "../../../core/models/favorite-school";
import {ToastService} from "../../../core/services/toast.service";

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    FooterComponent,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
    StarRatingComponent
  ],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  favoriteSchools: FavoriteSchool[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private schoolService: SchoolService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadFavoriteSchools();
  }

  loadFavoriteSchools(): void {
    this.loading = true;
    this.error = null;

    this.schoolService.getFavoriteSchools().pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (schools) => {
        this.favoriteSchools = schools;
        if (schools.length === 0) {
          this.error = 'Aucune école favorite trouvée. Explorez des écoles et ajoutez-les à vos favoris !';
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des favoris:', err);
        this.error = 'Impossible de charger vos écoles favorites. Veuillez réessayer plus tard.';
      }
    });
  }

  removeFromFavorites(schoolId: number, schoolName: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (confirm(`Êtes-vous sûr de vouloir supprimer ${schoolName} de vos favoris ?`)) {
      this.schoolService.removeFromFavorites(schoolId).subscribe({
        next: () => {
          this.favoriteSchools = this.favoriteSchools.filter(school => school.schoolId !== schoolId);
          this.toastService.success('Suppression réussie', `${schoolName} a été retiré de vos favoris.`);

          if (this.favoriteSchools.length === 0) {
            this.error = 'Aucune école favorite trouvée. Explorez des écoles et ajoutez-les à vos favoris !';
          }
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du favori:', err);
          this.toastService.error('Échec de la suppression', 'Impossible de retirer cette école de vos favoris.');
        }
      });
    }
  }

  updateNotes(favorite: FavoriteSchool, event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    favorite.notes = value;
    this.toastService.success('Notes mises à jour', 'Vos notes ont été enregistrées.');
  }

  protected readonly HTMLTextAreaElement = HTMLTextAreaElement;
}
