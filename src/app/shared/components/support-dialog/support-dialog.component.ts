import {Component, Inject} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MAT_DIALOG_DATA, MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";

@Component({
  selector: 'app-support-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './support-dialog.component.html',
  styleUrl: './support-dialog.component.css'
})
export class SupportDialogComponent {
  supportForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { requestId: number, schoolName: string }
  ) {
    this.supportForm = this.fb.group({
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }
}
