import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('token');
  const router = inject(Router);

  let request = req;

  if (!req.url.startsWith('http')) {
    request = req.clone({
      url: `${environment.apiUrl}${req.url}`
    });
  }

  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  request = request.clone({
    withCredentials: true
  });

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        localStorage.clear();
        router.navigate(['/login'], {
          queryParams: { sessionExpired: 'true' } // 👈 le avisas al login
        });
      }
      return throwError(() => error);
    })
  );
};