import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {SearchResponse} from "../models/search-response";
import {School} from "../models/school";
import {SchoolSearchRequest} from "../models/school-search-request";
import {environment} from "../../../environments/environment";
import {SchoolDetails} from "../models/school-details";
import {Category} from "../models/category";
import {FavoriteSchool} from "../models/favorite-school";
import {SchoolComparisonRequest} from "../models/school-comparison-request";
import {SchoolComparisonResponse} from "../models/school-comparison-response";

@Injectable({
  providedIn: 'root'
})
export class SchoolService {
  private apiUrl = `${environment.apiUrl}/api/`;

  constructor(private http: HttpClient) { }

  searchSchools(request: SchoolSearchRequest): Observable<SearchResponse<School>> {
    let params = new HttpParams();

    // Ajouter les paramètres de recherche
    if (request.name) params = params.set('name', request.name);
    if (request.city) params = params.set('city', request.city);
    if (request.postalCode) params = params.set('postalCode', request.postalCode);
    if (request.categoryId) params = params.set('categoryId', request.categoryId.toString());
    if (request.page !== undefined) params = params.set('page', request.page.toString());
    if (request.size) params = params.set('size', request.size.toString());
    if (request.sortBy) params = params.set('sortBy', request.sortBy);
    if (request.sortDirection) params = params.set('sortDirection', request.sortDirection);

    return this.http.get<SearchResponse<School>>(`${this.apiUrl}/schools/search`, { params });
  }
  getSchoolDetails(id: number): Observable<SchoolDetails> {
    return this.http.get<SchoolDetails>(`${this.apiUrl}/schools/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getFavoriteSchools(): Observable<FavoriteSchool[]> {
    return this.http.get<FavoriteSchool[]>(`${this.apiUrl}/favorites`);
  }
  addToFavorites(schoolId: number, notes?: string): Observable<void> {
    let params = new HttpParams();
    if (notes) params = params.set('notes', notes);
    return this.http.post<void>(`${this.apiUrl}/favorites/${schoolId}`, null, { params });
  }

  removeFromFavorites(schoolId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/favorites/${schoolId}`);
  }

  compareSchools(request: SchoolComparisonRequest): Observable<SchoolComparisonResponse> {
    return this.http.post<SchoolComparisonResponse>(`${this.apiUrl}/schools/comparison`, request);
  }
}
