import {inject, Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Category} from "../models/category";
import {Page} from "../models/common.model";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/categories`;

  getAllActiveCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.API_URL}/active`);
  }

  getAllCategories(page = 0, size = 10, sortBy = 'name', sortDir = 'asc'): Observable<Page<Category>> {
    return this.http.get<Page<Category>>(
      `${this.API_URL}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
    );
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.API_URL}/${id}`);
  }

  createCategory(category: Omit<Category, 'id'>): Observable<Category> {
    return this.http.post<Category>(this.API_URL, category);
  }

  updateCategory(id: number, category: Omit<Category, 'id'>): Observable<Category> {
    return this.http.put<Category>(`${this.API_URL}/${id}`, category);
  }

  toggleCategoryStatus(id: number, active: boolean): Observable<Category> {
    return this.http.patch<Category>(`${this.API_URL}/${id}/status?active=${active}`, {});
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

}
