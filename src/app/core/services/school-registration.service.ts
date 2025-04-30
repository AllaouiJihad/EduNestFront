import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {SchoolRegistrationRequest} from "../models/school-registration-request";
import {SchoolRegistrationResponse} from "../models/school-registration-response";
import {Observable} from "rxjs";
import {SchoolRegistrationReview} from "../models/school-registration-review";

@Injectable({
  providedIn: 'root'
})
export class SchoolRegistrationService {

  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/schools/registration`;

  submitSchoolRegistration(
    request: SchoolRegistrationRequest
  ): Observable<SchoolRegistrationResponse> {
    return this.http.post<SchoolRegistrationResponse>(`${this.API_URL}/submit`, request);
  }

  getMyRequests(): Observable<SchoolRegistrationResponse[]> {
    return this.http.get<SchoolRegistrationResponse[]>(`${this.API_URL}/my-requests`);
  }

  getPendingRequests(): Observable<SchoolRegistrationResponse[]> {
    return this.http.get<SchoolRegistrationResponse[]>(`${this.API_URL}/pending`);
  }

  reviewRequest(
    review: SchoolRegistrationReview
  ): Observable<SchoolRegistrationResponse> {
    return this.http.post<SchoolRegistrationResponse>(`${this.API_URL}/review`, review);
  }
}
