import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {FavoriteSchool} from "../models/favorite-school";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/favorites`;

  getFavoriteSchools(): Observable<FavoriteSchool[]> {
    return this.http.get<FavoriteSchool[]>(this.API_URL);
  }

  addFavoriteSchool(schoolId: number, notes?: string): Observable<void> {
    const url = notes
      ? `${this.API_URL}/${schoolId}?notes=${encodeURIComponent(notes)}`
      : `${this.API_URL}/${schoolId}`;
    return this.http.post<void>(url, {});
  }

  removeFavoriteSchool(schoolId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${schoolId}`);
  }
}
