import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {ActivatedRoute, Router, RouterModule} from "@angular/router";
import {SchoolDetails} from "../../../core/models/school-details";
import {SchoolService} from "../../../core/services/school.service";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {FavoriteService} from "../../../core/services/favorite.service";
import {ReviewService} from "../../../core/services/review.service";
import {AuthService} from "../../../core/services/auth.service";
import {Review} from "../../../core/models/review";
import {ReviewCreateRequest} from "../../../core/models/review-create-request";
import {StarRatingComponent} from "../star-rating/star-rating.component";

@Component({
  selector: 'app-school-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    StarRatingComponent
  ],
  templateUrl: './school-details.component.html',
  styleUrl: './school-details.component.css'
})
export class SchoolDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private schoolService = inject(SchoolService);
  private favoriteService = inject(FavoriteService);
  private reviewService = inject(ReviewService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  school: SchoolDetails | null = null;
  loading = true;
  error = false;

  // Reviews
  reviews: Review[] = [];
  totalReviews = 0;
  reviewsPage = 0;
  reviewsPageSize = 5;

  // Contact form
  contactForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });
  contactSubmitted = false;
  contactSuccess = false;

  // Review form
  reviewForm: FormGroup = this.fb.group({
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    content: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
  });

  showReviewForm = false;
  reviewSubmitted = false;
  reviewSuccess = false;

  // Favorite status
  isFavorite = false;
  isAuthenticated = false;

  // UI state
  activeTab = 'about';

  ngOnInit(): void {
    this.loadSchoolDetails();
    this.checkAuthentication();
    this.checkUrlFragment();
  }

  checkAuthentication(): void {
    this.isAuthenticated = this.authService.isLoggedIn();

    if (this.isAuthenticated) {
      this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.contactForm.patchValue({
            name: `${user.firstName} ${user.lastName}`,
            email: user.email
          });
        }
      });
    }
  }

  checkUrlFragment(): void {
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.activeTab = fragment;
        setTimeout(() => {
          const element = document.getElementById(fragment);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    });
  }

  loadSchoolDetails(): void {
    this.route.paramMap.subscribe(params => {
      const schoolId = params.get('id');
      if (schoolId) {
        this.schoolService.getSchoolDetails(+schoolId).subscribe({
          next: (school) => {
            this.school = school;
            this.loading = false;
            this.loadReviews();
            this.checkFavoriteStatus(+schoolId);
          },
          error: (error) => {
            console.error('Erreur lors du chargement des détails de l\'école', error);
            this.loading = false;
            this.error = true;
          }
        });
      }
    });
  }

  loadReviews(): void {
    if (!this.school) return;

    this.reviewService.getReviewsBySchool(this.school.id, this.reviewsPage, this.reviewsPageSize).subscribe({
      next: (response) => {
        this.reviews = response.content;
        this.totalReviews = response.totalElements;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des avis', error);
      }
    });
  }

  checkFavoriteStatus(schoolId: number): void {
    if (!this.isAuthenticated) return;

    this.favoriteService.getFavoriteSchools().subscribe({
      next: (favorites) => {
        this.isFavorite = favorites.some(f => f.schoolId === schoolId);
      },
      error: (error) => {
        console.error('Erreur lors de la vérification des favoris', error);
      }
    });
  }

  toggleFavorite(): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (!this.school) return;

    if (this.isFavorite) {
      this.favoriteService.removeFavoriteSchool(this.school.id).subscribe({
        next: () => {
          this.isFavorite = false;
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du favori', error);
        }
      });
    } else {
      this.favoriteService.addFavoriteSchool(this.school.id).subscribe({
        next: () => {
          this.isFavorite = true;
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout du favori', error);
        }
      });
    }
  }

  submitContact(): void {
    this.contactSubmitted = true;

    if (this.contactForm.invalid) return;

    // Simuler l'envoi du formulaire de contact
    setTimeout(() => {
      this.contactSuccess = true;
      this.contactForm.reset();
      this.contactSubmitted = false;

      // Réinitialiser le message de succès après quelques secondes
      setTimeout(() => {
        this.contactSuccess = false;
      }, 5000);
    }, 1000);
  }

  openReviewForm(): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.showReviewForm = true;
  }

  submitReview(): void {
    this.reviewSubmitted = true;

    if (this.reviewForm.invalid || !this.school) return;

    const request: ReviewCreateRequest = {
      schoolId: this.school.id,
      rating: this.reviewForm.value.rating,
      content: this.reviewForm.value.content
    };

    this.reviewService.createReview(request).subscribe({
      next: () => {
        this.reviewSuccess = true;
        this.reviewForm.reset({ rating: 5 });
        this.reviewSubmitted = false;
        this.showReviewForm = false;

        // Recharger les avis après soumission
        this.loadReviews();

        // Réinitialiser le message de succès après quelques secondes
        setTimeout(() => {
          this.reviewSuccess = false;
        }, 5000);
      },
      error: (error) => {
        console.error('Erreur lors de la soumission de l\'avis', error);
        this.reviewSubmitted = false;
      }
    });
  }

  changeTab(tabId: string): void {
    this.activeTab = tabId;
    this.router.navigate([], { fragment: tabId });
  }

  loadMoreReviews(): void {
    this.reviewsPage++;
    this.reviewService.getReviewsBySchool(this.school!.id, this.reviewsPage, this.reviewsPageSize).subscribe({
      next: (response) => {
        this.reviews = [...this.reviews, ...response.content];
      },
      error: (error) => {
        console.error('Erreur lors du chargement des avis supplémentaires', error);
        this.reviewsPage--; // Revenir à la page précédente en cas d'erreur
      }
    });
  }

  getAverageRating(): number {
    if (!this.school?.reviews || this.school.reviews.length === 0) return 0;

    const sum = this.school.reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / this.school.reviews.length;
  }

  getRatingDistribution(): number[] {
    if (!this.school?.reviews || this.school.reviews.length === 0) return [0, 0, 0, 0, 0];

    const distribution = [0, 0, 0, 0, 0];
    this.school.reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[Math.floor(review.rating) - 1]++;
      }
    });

    return distribution;
  }

  getRatingPercentage(count: number): number {
    if (!this.school?.reviews || this.school.reviews.length === 0) return 0;
    return (count / this.school.reviews.length) * 100;
  }

  protected readonly encodeURIComponent = encodeURIComponent;
}
