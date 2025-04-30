import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatChipsModule} from "@angular/material/chips";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatDividerModule} from "@angular/material/divider";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {RouterModule} from "@angular/router";
import {LoaderComponent} from "../../../shared/components/loader/loader.component";
import {EmptyStateComponent} from "../../../shared/components/empty-state/empty-state.component";
import {SupportDialogComponent} from "../../../shared/components/support-dialog/support-dialog.component";
import {SchoolRegistrationService} from "../../../core/services/school-registration.service";
import {SchoolService} from "../../../core/services/school.service";
import {SchoolRegistrationResponse} from "../../../core/models/school-registration-response";
import {catchError, EMPTY, finalize, Observable, of} from "rxjs";
import {RequestStatus} from "../../../core/models/school-registration-request";

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    MatSnackBarModule,
    MatDialogModule,
    RouterModule,
    LoaderComponent,
    EmptyStateComponent,
    SupportDialogComponent,
  ],
  templateUrl: './my-requests.component.html',
  styleUrl: './my-requests.component.css'
})
export class MyRequestsComponent implements OnInit{
  private registrationService = inject(SchoolRegistrationService);
  private schoolService = inject(SchoolService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  requests: SchoolRegistrationResponse[] = [];
  loading = true;
  error = false;

  // Maps pour stocker les informations relatives aux écoles
  schoolIdMap: Record<number, number> = {}; // ID de requête -> ID d'école
  schoolInfoMap: Record<number, { location: string, category: string }> = {}; // Informations supplémentaires

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.error = false;

    this.registrationService.getMyRequests()
      .pipe(
        catchError(err => {
          this.error = true;
          this.snackBar.open('Erreur lors du chargement des demandes', 'Fermer', {
            duration: 5000
          });
          console.error('Error loading requests:', err);
          return EMPTY;
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(requests => {
        this.requests = requests.sort((a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );

        // Charger les informations complémentaires pour les demandes approuvées
        this.loadSchoolInformation();
      });
  }

  loadSchoolInformation(): void {
    // Pour chaque demande approuvée, récupérer l'ID et les informations de l'école
    const approvedRequests = this.requests.filter(req => req.status === RequestStatus.APPROVED);

    approvedRequests.forEach(request => {
      // Simuler la récupération de l'ID d'école basée sur l'ID de demande
      // Dans une implémentation réelle, il faudrait faire une requête API
      this.getSchoolIdForRequest(request.id)
        .pipe(
          catchError(err => {
            console.error(`Error fetching school ID for request ${request.id}:`, err);
            return of(null);
          })
        )
        .subscribe(schoolId => {
          if (schoolId) {
            this.schoolIdMap[request.id] = schoolId;

            // Récupérer les informations complémentaires de l'école
            this.getSchoolDetails(schoolId);
          }
        });
    });
  }

  getSchoolIdForRequest(requestId: number): Observable<number | null> {
    // Simulation - dans une vraie implémentation, cette méthode ferait appel à une API
    // qui fournirait l'ID de l'école associée à la demande
    return of(1000 + requestId); // Exemple: ID école = 1000 + ID demande
  }

  getSchoolDetails(schoolId: number): void {
    this.schoolService.getSchoolDetails(schoolId)
      .pipe(
        catchError(err => {
          console.error(`Error fetching school details for ID ${schoolId}:`, err);
          return EMPTY;
        })
      )
      .subscribe(details => {
        // Trouver l'ID de la demande correspondante
        const requestId = Object.keys(this.schoolIdMap)
          .find(key => this.schoolIdMap[Number(key)] === schoolId);

        if (requestId) {
          this.schoolInfoMap[Number(requestId)] = {
            location: `${details.city}, ${details.postalCode}`,
            category: details.categoryName || 'Non catégorisé'
          };
        }
      });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusLabel(status: RequestStatus): string {
    switch(status) {
      case RequestStatus.APPROVED:
        return 'Approuvée';
      case RequestStatus.REJECTED:
        return 'Refusée';
      case RequestStatus.PENDING:
      default:
        return 'En attente';
    }
  }

  getStatusClass(status: RequestStatus): string {
    switch(status) {
      case RequestStatus.APPROVED:
        return 'status-approved';
      case RequestStatus.REJECTED:
        return 'status-rejected';
      case RequestStatus.PENDING:
      default:
        return 'status-pending';
    }
  }

  getSchoolId(request: SchoolRegistrationResponse): number {
    return this.schoolIdMap[request.id] || 0;
  }

  openSupportDialog(request: SchoolRegistrationResponse): void {
    const dialogRef = this.dialog.open(SupportDialogComponent, {
      width: '500px',
      data: {
        requestId: request.id,
        schoolName: request.schoolName
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Simuler l'envoi d'un message au support
        this.sendSupportRequest(request.id, result.subject, result.message);
      }
    });
  }

  sendSupportRequest(requestId: number, subject: string, message: string): void {
    // Dans une vraie implémentation, cette méthode enverrait une requête API
    // Pour l'exemple, on simule juste une réponse réussie

    this.loading = true;

    // Simulation d'une requête réseau avec timeout
    setTimeout(() => {
      this.loading = false;
      this.snackBar.open('Votre message a été envoyé au support avec succès', 'Fermer', {
        duration: 5000
      });
    }, 1000);
  }
}
