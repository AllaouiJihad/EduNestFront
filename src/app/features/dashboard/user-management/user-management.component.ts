import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {PaginationComponent} from "../../../shared/components/pagination/pagination.component";
import {User, UserRole} from "../../../core/models/user";

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit{
  users: User[] = [];
  filteredUsers: User[] = [];

  page: number = 0;
  size: number = 10;
  totalItems: number = 0;

  searchTerm: string = '';
  selectedRole: string = '';
  selectedStatus: string = '';

  showDeleteModal: boolean = false;
  userToDelete: User | null = null;

  showStatusModal: boolean = false;
  userToChangeStatus: User | null = null;

  userRoles = Object.values(UserRole);

  statuses = [
    { value: '', label: 'Tous les statuts' },
    { value: 'true', label: 'Actifs' },
    { value: 'false', label: 'Inactifs' }
  ];

  roles = [
    { value: '', label: 'Tous les rôles' },
    { value: UserRole.MEMBER, label: 'Membre' },
    { value: UserRole.SCHOOL_STAFF, label: 'Personnel d\'école' },
    { value: UserRole.SCHOOL_ADMIN, label: 'Administrateur d\'école' },
    { value: UserRole.ADMIN, label: 'Administrateur' }
  ];

  ngOnInit(): void {
    this.generateMockUsers();
    this.applyFilters();
  }

  generateMockUsers(): void {
    // Données factices pour la démo
    const mockUsers: User[] = [];

    for (let i = 1; i <= 50; i++) {
      const role = i % 10 === 0 ? UserRole.ADMIN :
        i % 5 === 0 ? UserRole.SCHOOL_ADMIN :
          i % 3 === 0 ? UserRole.SCHOOL_STAFF : UserRole.MEMBER;

      mockUsers.push({
        id: i,
        firstName: `Prénom${i}`,
        lastName: `Nom${i}`,
        email: `utilisateur${i}@exemple.com`,
        username: `user${i}`,
        phone: i % 2 === 0 ? `0612345${i.toString().padStart(3, '0')}` : undefined,
        active: i % 7 !== 0, // Quelques utilisateurs inactifs
        verified: i % 8 !== 0, // Quelques utilisateurs non vérifiés
        role: role
      });
    }

    this.users = mockUsers;
    this.totalItems = mockUsers.length;
  }

  applyFilters(): void {
    let filtered = [...this.users];

    // Filtre par terme de recherche
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(search) ||
        user.lastName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.username.toLowerCase().includes(search)
      );
    }

    // Filtre par rôle
    if (this.selectedRole) {
      filtered = filtered.filter(user => user.role === this.selectedRole);
    }

    // Filtre par statut
    if (this.selectedStatus !== '') {
      const isActive = this.selectedStatus === 'true';
      filtered = filtered.filter(user => user.active === isActive);
    }

    this.totalItems = filtered.length;

    // Pagination
    const startIndex = this.page * this.size;
    const endIndex = startIndex + this.size;
    this.filteredUsers = filtered.slice(startIndex, endIndex);
  }

  onSearch(): void {
    this.page = 0; // Retour à la première page
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.applyFilters();
  }

  getRoleLabel(role: UserRole): string {
    switch (role) {
      case UserRole.MEMBER:
        return 'Membre';
      case UserRole.SCHOOL_STAFF:
        return 'Personnel d\'école';
      case UserRole.SCHOOL_ADMIN:
        return 'Administrateur d\'école';
      case UserRole.ADMIN:
        return 'Administrateur';
      default:
        return role;
    }
  }

  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case UserRole.MEMBER:
        return 'badge-info';
      case UserRole.SCHOOL_STAFF:
        return 'badge-success';
      case UserRole.SCHOOL_ADMIN:
        return 'badge-warning';
      case UserRole.ADMIN:
        return 'badge-error';
      default:
        return '';
    }
  }

  confirmDelete(user: User): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  deleteUser(): void {
    if (!this.userToDelete) return;

    // Simuler la suppression (à remplacer par appel API réel)
    this.users = this.users.filter(u => u.id !== this.userToDelete!.id);
    this.showDeleteModal = false;
    this.userToDelete = null;
    this.applyFilters();
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  confirmStatusChange(user: User): void {
    this.userToChangeStatus = user;
    this.showStatusModal = true;
  }

  changeUserStatus(): void {
    if (!this.userToChangeStatus) return;

    // Simuler le changement de statut (à remplacer par appel API réel)
    const userIndex = this.users.findIndex(u => u.id === this.userToChangeStatus!.id);
    if (userIndex >= 0) {
      this.users[userIndex].active = !this.users[userIndex].active;
    }

    this.showStatusModal = false;
    this.userToChangeStatus = null;
    this.applyFilters();
  }

  cancelStatusChange(): void {
    this.showStatusModal = false;
    this.userToChangeStatus = null;
  }
}
