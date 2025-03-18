// src/app/core/interceptors/jwt.interceptor.ts

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);

  // Skip token for public endpoints
  if (
    request.url.includes('/auth/login') ||
    request.url.includes('/auth/register') ||
    request.url.includes('/auth/forgot-password') ||
    request.url.includes('/auth/reset-password') ||
    request.url.includes('/auth/verify')
  ) {
    return next(request);
  }

  return handleRequest(authService, request, next);
};

function handleRequest(authService: AuthService, request: HttpRequest<unknown>, next: HttpHandlerFn) {
  const token = authService.getToken();

  if (token) {
    request = addTokenToRequest(request, token);
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !request.url.includes('/auth/refresh-token')) {
        return handleUnauthorizedError(authService, request, next);
      }
      return throwError(() => error);
    })
  );
}

function addTokenToRequest(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function handleUnauthorizedError(authService: AuthService, request: HttpRequest<unknown>, next: HttpHandlerFn) {
  return authService.refreshToken().pipe(
    switchMap(response => {
      return next(addTokenToRequest(request, response.token));
    }),
    catchError(refreshError => {
      authService.logout();
      return throwError(() => refreshError);
    })
  );
}
