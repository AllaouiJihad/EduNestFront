import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.css'
})
export class StarRatingComponent implements OnChanges{
  @Input() rating: number = 0;
  stars: number[] = [0, 0, 0, 0, 0];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rating']) {
      this.calculateStars();
    }
  }

  private calculateStars(): void {
    this.stars = [];

    // Limiter la notation entre 0 et 5
    const rating = Math.max(0, Math.min(5, this.rating));

    // Calculer les étoiles pleines, demi et vides
    for (let i = 0; i < 5; i++) {
      if (rating >= i + 1) {
        this.stars.push(1); // Étoile pleine
      } else if (rating >= i + 0.5) {
        this.stars.push(0.5); // Demi-étoile
      } else {
        this.stars.push(0); // Étoile vide
      }
    }
  }
}
