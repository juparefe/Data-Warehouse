import { Observable, of, tap } from 'rxjs';
import { Auth } from '../interfaces/auth.interface';
import { Constants } from '../utilities/constants';
import { Injectable } from '@angular/core';
import { globalServiceRequests } from './global/global.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl: string = Constants.baseUrl;
  private _auth: Auth | undefined;

  get auth() {
    return { ...this._auth };
  }

  constructor(
    private globalServiceRequests: globalServiceRequests
  ) { }

  addUser(body: any) {
    return this.globalServiceRequests.post(
      `${this.baseUrl}/V1/data/user`,
      body
    );
  }

  verifyAuth(): Observable<boolean> {
    const authToken =sessionStorage.getItem('authToken');
    if (!authToken) {
      return of(false);
    } else {
      this._auth = { authToken };
      return of(true);
    };
  }

  login(body: Auth) {
    return this.globalServiceRequests.post(
      `${this.baseUrl}/V1/auth/login`,
      body
    ).pipe(
      tap(auth => {
        if (auth !== null) {
          this._auth = JSON.parse(auth).authToken;
        }
      })
    );
  }
}
