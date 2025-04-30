import {Component, Inject} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MAT_DIALOG_DATA, MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormControl, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-note-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './note-dialog.component.html',
  styleUrl: './note-dialog.component.css'
})
export class NoteDialogComponent {
  notesControl = new FormControl('');

  constructor(@Inject(MAT_DIALOG_DATA) public data: { schoolName: string, notes: string }) {
    this.notesControl.setValue(data.notes);
  }
}
