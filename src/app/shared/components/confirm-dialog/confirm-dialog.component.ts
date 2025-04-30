import {Component, Inject} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MAT_DIALOG_DATA, MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule
  ],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: 'primary' | 'accent' | 'warn';
  }) {}
}
