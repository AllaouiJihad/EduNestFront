import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {ActivatedRoute, RouterModule} from "@angular/router";
import {StarRatingComponent} from "../star-rating/star-rating.component";
import {SchoolDetails} from "../../../core/models/school-details";
import {SchoolService} from "../../../core/services/school.service";

@Component({
  selector: 'app-school-details',
  standalone: true,
  imports: [CommonModule, RouterModule, StarRatingComponent],
  templateUrl: './school-details.component.html',
  styleUrl: './school-details.component.css'
})
export class SchoolDetailsComponent implements OnInit {
  school: SchoolDetails | null = null;
  loading = true;
  error: string | null = null;
  currentImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private schoolService: SchoolService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const schoolId = Number(params.get('id'));
      if (schoolId) {
        this.loadSchoolDetails(schoolId);
      } else {
        this.error = "ID d'école invalide";
        this.loading = false;
      }
    });
  }

  loadSchoolDetails(schoolId: number): void {
    this.loading = true;
    this.error = null;

    this.schoolService.getSchoolDetails(schoolId).subscribe({
      next: (data) => {
        this.school = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des détails de l\'école:', err);
        this.error = 'Impossible de charger les détails de l\'école. Veuillez réessayer plus tard.';
        this.loading = false;
      }
    });
  }

  nextImage(): void {
    if (this.school && this.school.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.school.images.length;
    }
  }

  prevImage(): void {
    if (this.school && this.school.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.school.images.length) % this.school.images.length;
    }
  }

  addToFavorites(): void {
    if (this.school) {
      this.schoolService.addToFavorites(this.school.id).subscribe({
        next: () => {
          alert('École ajoutée aux favoris !');
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout aux favoris:', err);
          alert('Impossible d\'ajouter cette école aux favoris. Veuillez réessayer.');
        }
      });
    }
  }

}
