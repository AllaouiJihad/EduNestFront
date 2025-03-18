import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl } from '@angular/forms';
@Component({
  selector: 'app-form-errors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-errors.component.html',
  styleUrl: './form-errors.component.css'
})
export class FormErrorsComponent {
  @Input() control!: AbstractControl | FormControl;
  @Input() customError?: string;
  @Input() submitted = false;

  shouldShowErrors(): boolean {
    return !!(this.control &&
      this.control.errors &&
      (this.control.touched || this.control.dirty || this.submitted));
  }
}
