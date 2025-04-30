import {inject, Injectable} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';

import { environment } from "../../../environments/environment";
import {SchoolSearchResponse} from "../models/school-search-response";
import {Page} from "../models/common.model";
import {SchoolSearchRequest} from "../models/school-search-request";
import {SchoolDetails} from "../models/school-details";


@Injectable({
  providedIn: 'root'
})
export class SchoolService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/schools`;

  searchSchools(request: SchoolSearchRequest): Observable<Page<SchoolSearchResponse>> {
    let url = `${this.API_URL}/search?`;

    if (request.name) url += `name=${request.name}&`;
    if (request.city) url += `city=${request.city}&`;
    if (request.postalCode) url += `postalCode=${request.postalCode}&`;
    if (request.categoryId) url += `categoryId=${request.categoryId}&`;
    if (request.minRating) url += `minRating=${request.minRating}&`;
    if (request.maxRating) url += `maxRating=${request.maxRating}&`;

    url += `page=${request.page ?? 0}&`;
    url += `size=${request.size ?? 10}&`;
    url += `sortBy=${request.sortBy ?? 'name'}&`;
    url += `sortDirection=${request.sortDirection ?? 'asc'}`;

    return this.http.get<Page<SchoolSearchResponse>>(url);
  }

  getSchoolDetails(id: number): Observable<SchoolDetails> {
    return this.http.get<SchoolDetails>(`${this.API_URL}/${id}`);
  }

  getAllSchools(
    page = 0,
    size = 10,
    sortBy = 'name',
    sortDirection = 'asc'
  ): Observable<Page<SchoolSearchResponse>> {
    return this.http.get<Page<SchoolSearchResponse>>(
      `${this.API_URL}?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
    );
  }

  getAllActiveSchools(): Observable<SchoolSearchResponse[]> {
    return this.http.get<SchoolSearchResponse[]>(`${this.API_URL}/active`);
  }

  getSchoolsByCategory(
    categoryId: number,
    page = 0,
    size = 10
  ): Observable<Page<SchoolSearchResponse>> {
    return this.http.get<Page<SchoolSearchResponse>>(
      `${this.API_URL}/category/${categoryId}?page=${page}&size=${size}`
    );
  }

  getSchoolsByCity(
    city: string,
    page = 0,
    size = 10
  ): Observable<Page<SchoolSearchResponse>> {
    return this.http.get<Page<SchoolSearchResponse>>(
      `${this.API_URL}/city/${city}?page=${page}&size=${size}`
    );
  }

  deleteSchool(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
