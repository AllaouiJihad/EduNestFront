import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {StarRatingComponent} from "../star-rating/star-rating.component";
import {FavoriteSchool} from "../../../core/models/favorite-school";
import {SchoolComparisonResponse} from "../../../core/models/school-comparison-response";
import {SchoolService} from "../../../core/services/school.service";

@Component({
  selector: 'app-school-comparison',
  standalone: true,
  imports: [CommonModule, RouterModule, StarRatingComponent],
  templateUrl: './school-comparison.component.html',
  styleUrl: './school-comparison.component.css'
})
export class SchoolComparisonComponent implements OnInit{
  favoriteSchools: FavoriteSchool[] = [];
  selectedSchoolIds: number[] = [];
  comparisonResult: SchoolComparisonResponse | null = null;
  loading = false;
  error: string | null = null;

  constructor(private schoolService: SchoolService) { }

  ngOnInit(): void {
    this.loadFavoriteSchools();
  }

  loadFavoriteSchools(): void {
    this.loading = true;

    this.schoolService.getFavoriteSchools().subscribe({
      next: (schools) => {
        this.favoriteSchools = schools;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des écoles favorites:', err);
        this.error = 'Impossible de charger vos écoles favorites. Veuillez réessayer plus tard.';
        this.loading = false;
      }
    });
  }

  toggleSchoolSelection(schoolId: number): void {
    const index = this.selectedSchoolIds.indexOf(schoolId);

    if (index === -1) {
      // Limiter à 3 écoles pour la comparaison
      if (this.selectedSchoolIds.length < 3) {
        this.selectedSchoolIds.push(schoolId);
      } else {
        alert('Vous pouvez comparer jusqu\'à 3 écoles à la fois');
      }
    } else {
      this.selectedSchoolIds.splice(index, 1);
    }
  }

  compareSchools(): void {
    if (this.selectedSchoolIds.length < 2) {
      alert('Veuillez sélectionner au moins 2 écoles à comparer');
      return;
    }

    this.loading = true;
    this.error = null;

    this.schoolService.compareSchools({ schoolIds: this.selectedSchoolIds }).subscribe({
      next: (result) => {
        this.comparisonResult = result;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la comparaison des écoles:', err);
        this.error = 'Impossible de comparer ces écoles. Veuillez réessayer plus tard.';
        this.loading = false;
      }
    });
  }

  resetComparison(): void {
    this.comparisonResult = null;
    this.selectedSchoolIds = [];
  }

  removeFromFavorites(schoolId: number): void {
    if (confirm('Voulez-vous vraiment retirer cette école de vos favoris ?')) {
      this.schoolService.removeFromFavorites(schoolId).subscribe({
        next: () => {
          this.favoriteSchools = this.favoriteSchools.filter(school => school.schoolId !== schoolId);
          this.selectedSchoolIds = this.selectedSchoolIds.filter(id => id !== schoolId);

          if (this.comparisonResult) {
            this.resetComparison();
          }
        },
        error: (err) => {
          console.error('Erreur lors de la suppression des favoris:', err);
          alert('Impossible de supprimer cette école de vos favoris. Veuillez réessayer.');
        }
      });
    }
  }

  // Ajout des méthodes utilitaires pour l'affichage des données de comparaison
  getObjectKeys(obj: Record<string, string[]>): string[] {
    return Object.keys(obj);
  }

  parseRating(ratingStr: string): number {
    if (ratingStr === 'Aucune note') return 0;

    // Extraire la valeur numérique (par exemple "4.5/5" -> 4.5)
    const match = ratingStr.match(/^([\d.]+)\/5$/);
    if (match && match[1]) {
      return parseFloat(match[1]);
    }
    return 0;
  }
  isHighlightedValue(criteria: string, value: string, index: number): boolean {
    if (!this.comparisonResult) return false;

    // Pour les notes moyennes, on met en évidence la plus haute
    if (criteria === 'Note moyenne') {
      const ratings = this.comparisonResult.comparisonMatrix[criteria].map(r => this.parseRating(r));
      const maxRating = Math.max(...ratings);
      return this.parseRating(value) === maxRating && maxRating > 0;
    }

    // Pour le nombre d'avis, on met en évidence celui qui a le plus d'avis
    if (criteria === 'Nombre d\'avis') {
      const counts = this.comparisonResult.comparisonMatrix[criteria].map(c => parseInt(c, 10) || 0);
      const maxCount = Math.max(...counts);
      return (parseInt(value, 10) || 0) === maxCount && maxCount > 0;
    }

    return false;
  }


}
