import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {SchoolCardComponent} from "../../shared/components/school-card/school-card.component";
import {CategoryService} from "../../core/services/category.service";
import {SchoolService} from "../../core/services/school.service";
import {Category} from "../../core/models/category";
import {SchoolSearchResponse} from "../../core/models/school-search-response";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SchoolCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private schoolService = inject(SchoolService);

  categories: Category[] = [];
  featuredSchools: SchoolSearchResponse[] = [];
  searchTerm: string = '';
  selectedCity: string = '';
  selectedCategory: number | null = null;

  popularCities = [
    { name: 'Paris', imgSrc: 'assets/images/cities/paris.jpg' },
    { name: 'Lyon', imgSrc: 'assets/images/cities/lyon.jpg' },
    { name: 'Marseille', imgSrc: 'assets/images/cities/marseille.jpg' },
    { name: 'Toulouse', imgSrc: 'assets/images/cities/toulouse.jpg' },
    { name: 'Bordeaux', imgSrc: 'assets/images/cities/bordeaux.jpg' },
    { name: 'Lille', imgSrc: 'assets/images/cities/lille.jpg' }
  ];

  steps = [
    {
      icon: 'search',
      title: 'Recherchez',
      description: 'Utilisez nos filtres pour trouver des écoles selon vos critères : localisation, niveau, spécialité...'
    },
    {
      icon: 'compare',
      title: 'Comparez',
      description: 'Comparez plusieurs écoles côte à côte pour évaluer leurs services, tarifs et avis.'
    },
    {
      icon: 'school',
      title: 'Choisissez',
      description: 'Prenez une décision éclairée en fonction des informations détaillées sur chaque établissement.'
    },
    {
      icon: 'contact_page',
      title: 'Contactez',
      description: 'Contactez directement les écoles qui vous intéressent via notre plateforme.'
    }
  ];

  testimonials = [
    {
      name: 'Marie Dupont',
      role: 'Parent',
      content: 'Grâce à EduNest, j\'ai trouvé l\'école parfaite pour ma fille. La plateforme est intuitive et les informations sont complètes !',
      imgSrc: 'assets/images/testimonials/parent1.jpg'
    },
    {
      name: 'Philippe Martin',
      role: 'Directeur d\'école',
      content: 'Depuis que notre école est sur EduNest, nous avons vu une augmentation significative des demandes d\'information. Un outil essentiel pour notre visibilité !',
      imgSrc: 'assets/images/testimonials/director1.jpg'
    },
    {
      name: 'Sophie Legrand',
      role: 'Étudiante',
      content: 'J\'ai pu comparer facilement différentes écoles supérieures et faire un choix en fonction de mes critères prioritaires. Merci EduNest !',
      imgSrc: 'assets/images/testimonials/student1.jpg'
    }
  ];

  stats = [
    { value: '500+', label: 'Écoles inscrites' },
    { value: '15 000+', label: 'Utilisateurs actifs' },
    { value: '30 000+', label: 'Recherches mensuelles' },
    { value: '4.8/5', label: 'Note moyenne' }
  ];

  ngOnInit(): void {
    this.loadCategories();
    this.loadFeaturedSchools();
  }

  private loadCategories(): void {
    this.categoryService.getAllActiveCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des catégories', error);
      }
    });
  }

  private loadFeaturedSchools(): void {
    this.schoolService.getAllActiveSchools().subscribe({
      next: (data) => {
        // Prendre les 6 premières écoles pour la démonstration
        this.featuredSchools = data.slice(0, 6);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des écoles', error);
      }
    });
  }

  searchSchools(): void {
    // Naviguer vers la page de recherche avec les paramètres
    // À implémenter avec Router
  }

  searchByCity(city: string): void {
    this.selectedCity = city;
    this.searchSchools();
  }

  searchByCategory(categoryId: number): void {
    this.selectedCategory = categoryId;
    this.searchSchools();
  }
}
