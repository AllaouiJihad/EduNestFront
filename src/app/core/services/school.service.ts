import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { SearchResponse } from "../models/search-response";
import { School } from "../models/school";
import { SchoolSearchRequest } from "../models/school-search-request";
import { environment } from "../../../environments/environment";
import { SchoolDetails } from "../models/school-details";
import { Category } from "../models/category";
import { FavoriteSchool } from "../models/favorite-school";
import { SchoolComparisonRequest } from "../models/school-comparison-request";
import { SchoolComparisonResponse } from "../models/school-comparison-response";
import { catchError, map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class SchoolService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) { }

  searchSchools(request: SchoolSearchRequest): Observable<SearchResponse<School>> {
    let params = new HttpParams();

    // Ajouter les paramètres de recherche
    if (request.name) params = params.set('name', request.name);
    if (request.city) params = params.set('city', request.city);
    if (request.postalCode) params = params.set('postalCode', request.postalCode);
    if (request.categoryId) params = params.set('categoryId', request.categoryId);
    if (request.page !== undefined) params = params.set('page', request.page.toString());
    if (request.size) params = params.set('size', request.size.toString());
    if (request.sortBy) params = params.set('sortBy', request.sortBy);
    if (request.sortDirection) params = params.set('sortDirection', request.sortDirection);

    return this.http.get<SearchResponse<School>>(`${this.apiUrl}/schools/search`, { params })
      .pipe(
        map(response => this.normalizeSearchResponse<School>(response)),
        catchError(this.handleError<SearchResponse<School>>('searchSchools', {
          content: [],
          pageable: { pageNumber: 0, pageSize: 10, sort: { sorted: false, unsorted: true } },
          totalElements: 0,
          totalPages: 0,
          last: true,
          first: true,
          empty: true
        }))
      );
  }

  /**
   * Normalise la réponse de recherche pour gérer différents formats de réponse de l'API
   * @param response Réponse brute de l'API
   */
  private normalizeSearchResponse<T>(response: any): SearchResponse<T> {
    // Si la réponse est un tableau, la convertir en format de pagination
    if (Array.isArray(response)) {
      return {
        content: response as T[],
        pageable: {
          pageNumber: 0,
          pageSize: response.length,
          sort: { sorted: false, unsorted: true }
        },
        totalElements: response.length,
        totalPages: 1,
        last: true,
        first: true,
        empty: response.length === 0
      } as SearchResponse<T>;
    }

    // Si la réponse a déjà le format attendu, la retourner
    if (response && response.content && Array.isArray(response.content)) {
      return response as SearchResponse<T>;
    }

    // Cas d'erreur: format inattendu, retourner un résultat vide
    console.warn('Format de réponse inattendu:', response);
    return {
      content: [],
      pageable: {
        pageNumber: 0,
        pageSize: 10,
        sort: { sorted: false, unsorted: true }
      },
      totalElements: 0,
      totalPages: 0,
      last: true,
      first: true,
      empty: true
    } as SearchResponse<T>;
  }

  /**
   * Récupère les détails d'une école par son ID
   * @param id ID de l'école
   */
  getSchoolDetails(id: number): Observable<SchoolDetails> {
    return this.http.get<SchoolDetails>(`${this.apiUrl}/schools/${id}`)
      .pipe(
        catchError(this.handleError<SchoolDetails>('getSchoolDetails'))
      );
  }

  /**
   * Récupère toutes les catégories d'écoles
   */
  getCategories(): Observable<Category[]> {
    return this.http.get<any>(`${this.apiUrl}/categories/active`)
      .pipe(
        map((response: any) => {
          // Gestion des différents formats de réponse
          if (Array.isArray(response)) {
            return response as Category[];
          } else if (response && typeof response === 'object' && 'content' in response) {
            return (response.content || []) as Category[];
          } else {
            console.warn('Format de réponse inattendu pour les catégories:', response);
            return [] as Category[];
          }
        }),
        map((categories: Category[]) => {
          return categories.map((category: Category) => ({
            ...category,
            id: typeof category.id === 'number' ? String(category.id) : category.id
          }));
        }),
        catchError(this.handleError<Category[]>('getCategories', []))
      );
  }

  /**
   * Récupère la liste des écoles favorites de l'utilisateur
   */
  getFavoriteSchools(): Observable<FavoriteSchool[]> {
    return this.http.get<FavoriteSchool[]>(`${this.apiUrl}/favorites`)
      .pipe(
        catchError(this.handleError<FavoriteSchool[]>('getFavoriteSchools', []))
      );
  }

  /**
   * Ajoute une école aux favoris
   * @param schoolId ID de l'école à ajouter
   * @param notes Notes optionnelles
   */
  addToFavorites(schoolId: number, notes?: string): Observable<void> {
    let params = new HttpParams();
    if (notes) params = params.set('notes', notes);

    return this.http.post<void>(`${this.apiUrl}/favorites/${schoolId}`, null, { params })
      .pipe(
        catchError(this.handleError<void>('addToFavorites'))
      );
  }

  /**
   * Retire une école des favoris
   * @param schoolId ID de l'école à retirer
   */
  removeFromFavorites(schoolId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/favorites/${schoolId}`)
      .pipe(
        catchError(this.handleError<void>('removeFromFavorites'))
      );
  }

  /**
   * Compare plusieurs écoles
   * @param request Requête de comparaison contenant les IDs des écoles
   */
  compareSchools(request: SchoolComparisonRequest): Observable<SchoolComparisonResponse> {
    return this.http.post<SchoolComparisonResponse>(`${this.apiUrl}/schools/comparison`, request)
      .pipe(
        catchError(this.handleError<SchoolComparisonResponse>('compareSchools'))
      );
  }

  /**
   * Gestion des erreurs HTTP
   * @param operation Nom de l'opération qui a échoué
   * @param result Valeur à retourner en cas d'erreur
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} a échoué:`, error);

      // Journalisation de l'erreur
      console.error(`Erreur ${operation}:`, error.message);

      // Retourner une valeur par défaut pour continuer l'exécution
      return of(result as T);
    };
  }
}
