import {Component, Input} from '@angular/core';
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {SchoolSearchResponse} from "../../../core/models/school-search-response";
import {StarRatingComponent} from "../../../features/school/star-rating/star-rating.component";

@Component({
  selector: 'app-school-card',
  standalone: true,
  imports: [CommonModule, RouterModule, StarRatingComponent],
  templateUrl: './school-card.component.html',
  styleUrl: './school-card.component.css'
})
export class SchoolCardComponent {
  @Input() school!: SchoolSearchResponse;
  @Input() imageUrl?: string;

  onCompareClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    // Logique pour ajouter à la comparaison
    // À implémenter
  }

}
