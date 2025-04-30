import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {StarRatingComponent} from "../star-rating/star-rating.component";
import {FormsModule} from "@angular/forms";
import {SchoolSearchResponse} from "../../../core/models/school-search-response";
import {SchoolService} from "../../../core/services/school.service";
import {SchoolDetails} from "../../../core/models/school-details";

@Component({
  selector: 'app-school-comparison',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    StarRatingComponent
  ],
  templateUrl: './school-comparison.component.html',
  styleUrl: './school-comparison.component.css'
})
export class SchoolComparisonComponent implements OnInit{
  private schoolService = inject(SchoolService);

  schools: SchoolDetails[] = [];
  selectedSchoolIds: (number | null)[] = [null, null];
  availableSchools: SchoolSearchResponse[] = [];

  loading = false;
  fetchingSchools = false;

  compareCategories = [
    { id: 'general', name: 'Informations générales', icon: 'info' },
    { id: 'location', name: 'Localisation', icon: 'place' },
    { id: 'ratings', name: 'Évaluations', icon: 'star' },
    { id: 'contact', name: 'Contact', icon: 'contact_mail' }
  ];

  activeCategory = 'general';

  ngOnInit(): void {
    this.loadAvailableSchools();
    // Vérifier si des écoles sont déjà dans le localStorage (pour une session précédente)
    this.checkLocalStorage();
  }

  // Nouvelle méthode pour vérifier si au moins une école est sélectionnée
  hasSelectedSchools(): boolean {
    return this.selectedSchoolIds.some(item => item !== null);
  }

  loadAvailableSchools(): void {
    this.fetchingSchools = true;
    this.schoolService.getAllActiveSchools().subscribe({
      next: (schools) => {
        this.availableSchools = schools;
        this.fetchingSchools = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des écoles', error);
        this.fetchingSchools = false;
      }
    });
  }

  checkLocalStorage(): void {
    const comparisonData = localStorage.getItem('schoolComparison');
    if (comparisonData) {
      try {
        const ids = JSON.parse(comparisonData) as number[];
        this.selectedSchoolIds = ids;
        this.loadSelectedSchools();
      } catch (e) {
        localStorage.removeItem('schoolComparison');
      }
    }
  }

  onSchoolSelect(index: number): void {
    if (this.selectedSchoolIds[index]) {
      this.loadSelectedSchools();
    } else {
      // Si l'école est supprimée, on met à jour l'array
      this.schools[index] = undefined as any;
    }

    // Sauvegarder la sélection dans localStorage
    localStorage.setItem('schoolComparison', JSON.stringify(this.selectedSchoolIds.filter(id => id !== null)));
  }

  loadSelectedSchools(): void {
    this.loading = true;
    const promises: Promise<void>[] = [];

    this.selectedSchoolIds.forEach((id, index) => {
      if (id) {
        const promise = new Promise<void>((resolve) => {
          this.schoolService.getSchoolDetails(id).subscribe({
            next: (school) => {
              this.schools[index] = school;
              resolve();
            },
            error: (error) => {
              console.error(`Erreur lors du chargement de l'école ${id}`, error);
              this.schools[index] = undefined as any;
              resolve();
            }
          });
        });

        promises.push(promise);
      } else {
        this.schools[index] = undefined as any;
      }
    });

    Promise.all(promises).then(() => {
      this.loading = false;
    });
  }

  changeCategory(categoryId: string): void {
    this.activeCategory = categoryId;
  }

  clearComparison(): void {
    this.selectedSchoolIds = [null, null];
    this.schools = [];
    localStorage.removeItem('schoolComparison');
  }

  addSchool(): void {
    if (this.selectedSchoolIds.length < 3) {
      this.selectedSchoolIds.push(null);
      this.schools.push(undefined as any);
    }
  }

  removeSchool(index: number): void {
    this.selectedSchoolIds.splice(index, 1);
    this.schools.splice(index, 1);
    localStorage.setItem('schoolComparison', JSON.stringify(this.selectedSchoolIds.filter(id => id !== null)));
  }

  // Comparer les écoles en fonction du nombre d'avis
  compareReviewCount(schools: SchoolDetails[]): string[] {
    const counts = schools.map(s => s?.reviews?.length || 0);
    const maxCount = Math.max(...counts);

    return counts.map(count => {
      if (count === maxCount && maxCount > 0) {
        return 'text-green-600 font-semibold';
      }
      return '';
    });
  }

  // Comparer les écoles en fonction de la note moyenne
  compareRatings(schools: SchoolDetails[]): string[] {
    const ratings = schools.map(s => {
      if (!s?.reviews || s.reviews.length === 0) return 0;
      const sum = s.reviews.reduce((acc, r) => acc + r.rating, 0);
      return sum / s.reviews.length;
    });

    const maxRating = Math.max(...ratings);

    return ratings.map(rating => {
      if (rating === maxRating && maxRating > 0) {
        return 'text-green-600 font-semibold';
      }
      return '';
    });
  }






  // Pour gérer l'encodage URL
  getMapUrl(school: SchoolDetails): string {
    if (!school || !school.address || !school.city) return '';
    const query = school.address + ', ' + school.city;
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);
  }

// Pour calculer la note moyenne d'une école
  getAverageRating(school: SchoolDetails): number {
    if (!school?.reviews || school.reviews.length === 0) return 0;

    let total = 0;
    for (let i = 0; i < school.reviews.length; i++) {
      total += school.reviews[i].rating;
    }

    return total / school.reviews.length;
  }
}
