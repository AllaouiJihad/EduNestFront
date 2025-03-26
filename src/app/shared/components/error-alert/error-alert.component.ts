import {Component, Input} from '@angular/core';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-error-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-alert.component.html',
  styleUrl: './error-alert.component.css'
})
export class ErrorAlertComponent {
  @Input() message: string = '';

}
