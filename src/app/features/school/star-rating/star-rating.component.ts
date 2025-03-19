import {Component, Input} from '@angular/core';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.css'
})
export class StarRatingComponent {
  @Input() set rating(value: number) {
    this._rating = value || 0;
    this.calculateStars();
  }

  get rating(): number {
    return this._rating;
  }

  private _rating: number = 0;
  stars: number[] = [0, 1, 2, 3, 4];
  filledStars: number = 0;
  halfStar: number = -1;

  private calculateStars(): void {
    this.filledStars = Math.floor(this.rating);
    const remainder = this.rating - this.filledStars;

    if (remainder >= 0.5) {
      this.halfStar = this.filledStars;
    } else {
      this.halfStar = -1;
    }
  }
}
