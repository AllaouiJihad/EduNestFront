import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
export type AlertType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(-10px)'
      })),
      transition('void <=> *', animate('300ms ease-in-out'))
    ])
  ]
})
export class AlertComponent implements OnInit {
  @Input() type: AlertType = 'info';
  @Input() message?: string;
  @Input() dismissible = true;
  @Input() autoClose = false;
  @Input() duration = 5000; // ms

  @Output() closed = new EventEmitter<void>();

  visible = true;

  get alertClasses(): {[key: string]: boolean} {
    return {
      [`alert-${this.type}`]: true
    };
  }

  ngOnInit(): void {
    if (this.autoClose) {
      setTimeout(() => this.close(), this.duration);
    }
  }

  close(): void {
    this.visible = false;
    this.closed.emit();
  }
}
