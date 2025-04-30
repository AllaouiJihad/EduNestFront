import {Component, EventEmitter, Input, Output} from '@angular/core';
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
  @Input() showValue = false;
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

  onRatingChange(rating: number): void {
    if (!this.readOnly) {
      this.rating = rating;
      this.ratingChange.emit(rating);
    }
  }

  getTooltipText(value: number): string {
    const labels = ['Très mauvais', 'Mauvais', 'Moyen', 'Bon', 'Excellent'];
    return labels[value - 1] || `${value} étoiles`;
  }
}
