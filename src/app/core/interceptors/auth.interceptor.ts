import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { environment } from '../../../environments/environment';
import { from, Observable, of, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const backendUrl = environment.backendUrl;
  const shouldAttach = backendUrl && req.url.startsWith(backendUrl);
  if (!shouldAttach) {
    return next(req);
  }

  const auth = inject(Auth);
  const user = auth.currentUser;
  if (!user) {
    return next(req);
  }

  return from(user.getIdToken()).pipe(
    switchMap((token) => {
      const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      return next(authReq);
    })
  );
};




