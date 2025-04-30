import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {SchoolService} from "../../../core/services/school.service";
import {CategoryService} from "../../../core/services/category.service";
import {SchoolRegistrationService} from "../../../core/services/school-registration.service";

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit{
  private schoolService = inject(SchoolService);
  private categoryService = inject(CategoryService);
  private registrationService = inject(SchoolRegistrationService);

  totalSchools: number = 0;
  activeSchools: number = 0;
  pendingRegistrations: number = 0;
  totalCategories: number = 0;

  // Stats
  stats = [
    { title: 'Écoles', value: 0, icon: 'school', route: '/admin/schools', color: 'bg-blue-100 text-blue-800' },
    { title: 'Catégories', value: 0, icon: 'category', route: '/admin/categories', color: 'bg-green-100 text-green-800' },
    { title: 'Inscriptions en attente', value: 0, icon: 'pending_actions', route: '/admin/registrations', color: 'bg-amber-100 text-amber-800' },
    { title: 'Utilisateurs', value: 0, icon: 'people', route: '/admin/users', color: 'bg-purple-100 text-purple-800' }
  ];

  // Graphiques (données simulées)
  registrationData = [
    { month: 'Jan', count: 10 },
    { month: 'Fév', count: 15 },
    { month: 'Mar', count: 20 },
    { month: 'Avr', count: 18 },
    { month: 'Mai', count: 25 },
    { month: 'Juin', count: 30 }
  ];

  // Activités récentes (simulées)
  recentActivities = [
    { type: 'registration', school: 'École Montessori Paris', date: new Date(2025, 2, 28), status: 'pending' },
    { type: 'approval', school: 'Lycée International de Lyon', date: new Date(2025, 2, 27), status: 'approved' },
    { type: 'rejection', school: 'Centre de Formation Fictif', date: new Date(2025, 2, 26), status: 'rejected' },
    { type: 'registration', school: 'École Primaire des Lilas', date: new Date(2025, 2, 25), status: 'pending' }
  ];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Récupérer le nombre total d'écoles
    this.schoolService.getAllSchools(0, 1).subscribe({
      next: (response) => {
        this.totalSchools = response.totalElements;
        this.stats[0].value = this.totalSchools;
      },
      error: (error) => console.error('Erreur lors du chargement des écoles', error)
    });

    // Récupérer le nombre d'écoles actives
    this.schoolService.getAllActiveSchools().subscribe({
      next: (schools) => {
        this.activeSchools = schools.length;
      },
      error: (error) => console.error('Erreur lors du chargement des écoles actives', error)
    });

    // Récupérer le nombre total de catégories
    this.categoryService.getAllCategories(0, 1).subscribe({
      next: (response) => {
        this.totalCategories = response.totalElements;
        this.stats[1].value = this.totalCategories;
      },
      error: (error) => console.error('Erreur lors du chargement des catégories', error)
    });

    // Récupérer le nombre d'inscriptions en attente
    this.registrationService.getPendingRequests().subscribe({
      next: (requests) => {
        this.pendingRegistrations = requests.length;
        this.stats[2].value = this.pendingRegistrations;
      },
      error: (error) => console.error('Erreur lors du chargement des inscriptions', error)
    });

    // Simuler le nombre d'utilisateurs (à remplacer par un vrai service)
    this.stats[3].value = 345;
  }

}
