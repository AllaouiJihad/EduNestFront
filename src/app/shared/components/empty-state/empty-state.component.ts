import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {RouterModule} from "@angular/router";

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css'
})
export class EmptyStateComponent {
  @Input() icon = 'info';
  @Input() title = 'Aucun élément trouvé';
  @Input() message = 'Il n\'y a aucun élément à afficher.';
  @Input() actionButton = false;
  @Input() actionLabel = 'Action';
  @Input() actionLink: string | null = null;
  @Output() actionClick = new EventEmitter<void>();
}
