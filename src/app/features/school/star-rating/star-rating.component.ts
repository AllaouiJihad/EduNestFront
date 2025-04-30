import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.css'
})
export class StarRatingComponent {


  @Input() rating = 0;
  @Input() maxRating = 5;
  @Input() readOnly = false;
  @Input() showRating = false;
  @Input() showCount = false;
  @Input() count = 0;
  @Input() size = 5; // Taille des étoiles (1-5 est une bonne échelle)
  @Input() interactive = false; // Si l'utilisateur peut interagir avec les étoiles
  @Output() ratingChange = new EventEmitter<number>();

  get stars(): { filled: boolean, half: boolean }[] {
    return Array(this.maxRating).fill(0).map((_, i) => {
      const position = i + 1;
      return {
        filled: position <= this.rating,
        half: position > this.rating && position - 0.5 <= this.rating
      };
    });
  }

  getIconSize(): number {
    // Convertir la taille en échelle raisonnable pour les icônes
    // size 1 = 0.8rem, size 5 = 2rem
    const sizeMap = {
      1: 0.8,
      2: 1,
      3: 1.25,
      4: 1.5,
      5: 2,
    };

    return sizeMap[this.size as keyof typeof sizeMap] || 1.25;
  }

  onRatingChange(rating: number): void {
    if (this.interactive && !this.readOnly) {
      this.rating = rating;
      this.ratingChange.emit(rating);
    }
  }

  getTooltipText(value: number): string {
    const labels = ['Très mauvais', 'Mauvais', 'Moyen', 'Bon', 'Excellent'];
    return labels[value - 1] || `${value} étoiles`;
  }
}
