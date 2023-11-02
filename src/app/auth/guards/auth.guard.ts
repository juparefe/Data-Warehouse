import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree }
  from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad, CanActivate {

  constructor(private authService: AuthService,
              private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.verifyAuth().pipe(
      tap(auth => {
        if (!auth) {
          this.router.navigate(['./auth/login']);
        }
      }),
    );
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.verifyAuth().pipe(
      tap(auth => {
        if (!auth) {
          this.router.navigate(['./auth/login']);
        }
      }),
    );
  }
}
