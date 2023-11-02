import { Constants } from '../utilities/constants';
import { Contact } from '../interfaces/contact.interface';
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { globalServiceRequests } from './global/global.service';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {

  private baseUrl: string = Constants.baseUrl;

  constructor(private globalServiceRequests: globalServiceRequests) { }

  addContact(body: any, authToken: string) {
    const headers: HttpHeaders = new HttpHeaders({
      'access-token': authToken
    });
    return this.globalServiceRequests.post(
      `${this.baseUrl}/V1/data/contact`,
      body,
      headers
    );
  }

  addContacts(body: any, authToken: string) {
    const headers: HttpHeaders = new HttpHeaders({
      'access-token': authToken
    });
    return this.globalServiceRequests.post(
      `${this.baseUrl}/V1/data/contact-list`,
      body,
      headers
    );
  }

  applyFilters(body: any[], authToken: string) {
    const headers: HttpHeaders = new HttpHeaders({
      'access-token': authToken
    });
    return this.globalServiceRequests.post(
      `${this.baseUrl}/V1/data/contacts`,
      body,
      headers
    );
  }

  deleteContact(index: any, authToken: string) {
    const headers: HttpHeaders = new HttpHeaders({
      'access-token': authToken
    });
    return this.globalServiceRequests.delete(
      `${this.baseUrl}/V1/data/contact/${index}`,
      undefined,
      headers
    );
  }

  deleteContacts(contacts: any[], authToken: string) {
    const body = contacts.map((contact: Contact) => contact.id);
    const headers: HttpHeaders = new HttpHeaders({
      'access-token': authToken
    });
    return this.globalServiceRequests.delete(
      `${this.baseUrl}/V1/data/contact-list`,
      body,
      headers
    );
  }

  getContacts(authToken: string) {
    const headers: HttpHeaders = new HttpHeaders({
      'access-token': authToken
    });
    return this.globalServiceRequests.get(
      `${this.baseUrl}/V1/data/contacts`,
      headers
    );
  }

  updateContact(body: any, authToken: string) {
    const headers: HttpHeaders = new HttpHeaders({
      'access-token': authToken
    });
    return this.globalServiceRequests.put(
      `${this.baseUrl}/V1/data/contact/${body.id}`,
      body,
      headers
    );
  }
}
