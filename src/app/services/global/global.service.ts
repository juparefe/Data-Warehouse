import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class globalServiceRequests {

  constructor(
    private readonly http: HttpClient
  ) { }

  delete(url: string, body?: any, headers?: HttpHeaders): Observable<any> {
    return this.http.delete(url, {
      headers,
      responseType: 'text',
      body,
      observe: 'response'
    }).pipe(
      map(response => {
        return response.status === 200 ? response.body : null;
      }),
      catchError(error => throwError(() => this.handleError(error)))
    );
  }

  get(url: string, headers?: HttpHeaders): Observable<any> {
    return this.http.get(url, {
      headers,
      responseType: 'text',
      observe: 'response'
    }).pipe(
      map(response => {return response.body;}),
      catchError(error => throwError(() => this.handleError(error)))
    );
  }

  patch(url: string, body: any, headers?: HttpHeaders): Observable<any> {
    return this.http.patch(url, body, {
      headers,
      responseType: 'text',
      observe: 'response'
    }).pipe(
      map(response => {
        return response.status === 200 ? response.body : null;
      }),
      catchError(error => throwError(() => this.handleError(error)))
    );
  }

  post(url: string, body: any, headers?: HttpHeaders): Observable<any> {
    return this.http.post(url, body, {
      headers,
      responseType: 'text',
      observe: 'response'
    }).pipe(
      map(response => {
        return response.status === 200 ? response.body : null;
      }),
      catchError(error => throwError(() => this.handleError(error)))
    );
  }

  put(url: string, body: any, headers?: HttpHeaders): Observable<any> {
    return this.http.put(url, body, {
      headers,
      responseType: 'text',
      observe: 'response'
    }).pipe(
      map(response => {
        return response.status === 200 ? response.body : null;
      }),
      catchError(error => throwError(() => this.handleError(error)))
    );
  }

  private handleError(error: HttpErrorResponse): HttpErrorResponse {
    return {
      ...error,
      error: JSON.parse(error.error)
    };
  }
}
