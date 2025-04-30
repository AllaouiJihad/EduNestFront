import {Component, Input} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";

@Component({
  selector: 'app-info-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './info-card.component.html',
  styleUrl: './info-card.component.css'
})
export class InfoCardComponent {
  @Input() title = '';
  @Input() icon = 'info';
  @Input() items: string[] = [];
}
