import { Company } from '../interfaces/company.interface';
import { Constants } from '../utilities/constants';
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { globalServiceRequests } from './global/global.service';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private baseUrl: string = Constants.baseUrl;

  constructor(
    private globalServiceRequests: globalServiceRequests
  ) { }

  addCompany(body: any, authToken: string) {
    const headers: HttpHeaders = new HttpHeaders({
      'access-token': authToken
    });
    return this.globalServiceRequests.post(
      `${this.baseUrl}/V1/data/company`,
      body,
      headers
    );
  }

  addCompanies(body: any, authToken: string) {
    const headers: HttpHeaders = new HttpHeaders({
      'access-token': authToken
    });
    return this.globalServiceRequests.post(
      `${this.baseUrl}/V1/data/company-list`,
      body,
      headers
    );
  }

  applyFilters(body: any[], authToken: string) {
    const headers: HttpHeaders = new HttpHeaders({
      'access-token': authToken
    });
    return this.globalServiceRequests.post(
      `${this.baseUrl}/V1/data/companies`,
      body,
      headers
    );
  }

  deleteCompany(index: any, authToken: string) {
    const headers: HttpHeaders = new HttpHeaders({
      'access-token': authToken
    });
    return this.globalServiceRequests.delete(
      `${this.baseUrl}/V1/data/company/${index}`,
      undefined,
      headers
    );
  }

  deleteCompanies(companies: any[], authToken: string) {
    const body = companies.map((company: Company) => company.id);
    const headers: HttpHeaders = new HttpHeaders({
      'access-token': authToken
    });
    return this.globalServiceRequests.delete(
      `${this.baseUrl}/V1/data/company-list`,
      body,
      headers
    );
  }

  getCompanies(authToken: string) {
    const headers: HttpHeaders = new HttpHeaders({
      'access-token': authToken
    });
    return this.globalServiceRequests.get(
      `${this.baseUrl}/V1/data/companies`,
      headers
    );
  }

  getCountries() {
    return this.globalServiceRequests.get(
      `${this.baseUrl}/V1/data/countries`
    ).pipe(
      map((countries: any) => JSON.parse(countries).map((country: any) => country.name_common))
    );
  }

  getCountriesByRegion(region: string) {
    return this.globalServiceRequests.get(
      `${this.baseUrl}/V1/data/countries/${region}`
    ).pipe(
      map((countries: any) => JSON.parse(countries).map((country: any) => country.name_common))
    );
  }

  getRegions() {
    return this.globalServiceRequests.get(
      `${this.baseUrl}/V1/data/regions`
    ).pipe(
      map((regions: any) => JSON.parse(regions).map((region: any) => region.name))
    );
  }

  updateCompany(body: any, authToken: string) {
    const headers: HttpHeaders = new HttpHeaders({
      'access-token': authToken
    });
    return this.globalServiceRequests.put(
      `${this.baseUrl}/V1/data/company/${body.id}`,
      body,
      headers
    );
  }
}
