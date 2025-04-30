import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {ReviewCreateRequest} from "../models/review-create-request";
import { Observable } from 'rxjs';
import {Review} from "../models/review";
import {ReviewUpdateRequest} from "../models/review-update-request";
import {Page} from "../models/common.model";

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/reviews`;

  createReview(request: ReviewCreateRequest): Observable<Review> {
    return this.http.post<Review>(this.API_URL, request);
  }

  updateReview(id: number, request: ReviewUpdateRequest): Observable<Review> {
    return this.http.put<Review>(`${this.API_URL}/${id}`, request);
  }

  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getReviewsBySchool(
    schoolId: number,
    page = 0,
    size = 10
  ): Observable<Page<Review>> {
    return this.http.get<Page<Review>>(
      `${this.API_URL}/school/${schoolId}?page=${page}&size=${size}`
    );
  }

  getMyReviews(page = 0, size = 10): Observable<Page<Review>> {
    return this.http.get<Page<Review>>(
      `${this.API_URL}/member/me?page=${page}&size=${size}`
    );
  }

  getReviewById(id: number): Observable<Review> {
    return this.http.get<Review>(`${this.API_URL}/${id}`);
  }
}
