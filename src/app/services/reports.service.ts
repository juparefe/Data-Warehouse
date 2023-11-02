import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { globalServiceRequests } from './global/global.service';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  constructor(private globalServiceRequests: globalServiceRequests) { }

  getChartData(authToken: string, endpoint: string) {
    const headers: HttpHeaders = new HttpHeaders({
      'access-token': authToken
    });
    return this.globalServiceRequests.get(endpoint, headers);
  }
}
