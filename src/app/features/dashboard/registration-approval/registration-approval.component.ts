import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {SchoolRegistrationReview} from "../../../core/models/school-registration-review";
import {SchoolRegistrationResponse} from "../../../core/models/school-registration-response";
import {Category} from "../../../core/models/category";
import {RequestStatus} from "../../../core/models/school-registration-request";
import {SchoolRegistrationService} from "../../../core/services/school-registration.service";
import {CategoryService} from "../../../core/services/category.service";

@Component({
  selector: 'app-registration-approval',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './registration-approval.component.html',
  styleUrl: './registration-approval.component.css'
})
export class RegistrationApprovalComponent implements OnInit {
  private registrationService = inject(SchoolRegistrationService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  pendingRequests: SchoolRegistrationResponse[] = []; // Changé en SchoolRegistrationResponse
  selectedRequest: SchoolRegistrationResponse | null = null;
  categories: Category[] = [];

  showApprovalModal: boolean = false;
  showRejectionModal: boolean = false;

  reviewForm: FormGroup = this.fb.group({
    notes: ['', [Validators.maxLength(500)]],
  });

  RequestStatus = RequestStatus; // Pour utiliser l'enum dans le template

  ngOnInit(): void {
    this.loadPendingRequests();
    this.loadCategories();
  }

  loadPendingRequests(): void {
    this.registrationService.getPendingRequests().subscribe({
      next: (requests) => {
        this.pendingRequests = requests;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des demandes d\'inscription', error);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAllActiveCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des catégories', error);
      }
    });
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Catégorie inconnue';
  }

  openApprovalModal(request: SchoolRegistrationResponse): void {
    this.selectedRequest = request;
    this.reviewForm.reset();
    this.showApprovalModal = true;
  }

  openRejectionModal(request: SchoolRegistrationResponse): void {
    this.selectedRequest = request;
    this.reviewForm.reset();
    this.showRejectionModal = true;
  }

  approveRequest(): void {
    if (!this.selectedRequest) return;

    const review: SchoolRegistrationReview = {
      requestId: this.selectedRequest.id,
      approved: true,
      notes: this.reviewForm.value.notes
    };

    this.registrationService.reviewRequest(review).subscribe({
      next: () => {
        this.pendingRequests = this.pendingRequests.filter(r => r.id !== this.selectedRequest!.id);
        this.showApprovalModal = false;
        this.selectedRequest = null;
      },
      error: (error) => {
        console.error('Erreur lors de l\'approbation de la demande', error);
      }
    });
  }

  rejectRequest(): void {
    if (!this.selectedRequest) return;

    const review: SchoolRegistrationReview = {
      requestId: this.selectedRequest.id,
      approved: false,
      notes: this.reviewForm.value.notes
    };

    this.registrationService.reviewRequest(review).subscribe({
      next: () => {
        this.pendingRequests = this.pendingRequests.filter(r => r.id !== this.selectedRequest!.id);
        this.showRejectionModal = false;
        this.selectedRequest = null;
      },
      error: (error) => {
        console.error('Erreur lors du rejet de la demande', error);
      }
    });
  }

  closeModals(): void {
    this.showApprovalModal = false;
    this.showRejectionModal = false;
    this.selectedRequest = null;
  }

  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDescription(description: string | undefined, maxLength: number = 100): string {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }
}
