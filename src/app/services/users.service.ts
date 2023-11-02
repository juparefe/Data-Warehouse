import { Constants } from '../utilities/constants';
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { globalServiceRequests } from './global/global.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private baseUrl: string = Constants.baseUrl;

  constructor(private globalService: globalServiceRequests) { }

  getUsers(userName: string) {
    const headers: HttpHeaders = new HttpHeaders({
      userName
    });
    return this.globalService.get(
      `${this.baseUrl}/V1/data/users`,
      headers
    );
  }

  deleteUser(index: any, authToken: string) {
    const headers: HttpHeaders = new HttpHeaders({
      'access-token': authToken
    });
    return this.globalService.delete(
      `${this.baseUrl}/V1/data/user/${index}`,
      undefined,
      headers
    );
  }

  updateUser(body: any, authToken: string) {
    const headers: HttpHeaders = new HttpHeaders({
      'access-token': authToken
    });
    return this.globalService.put(
      `${this.baseUrl}/V1/data/user/${body.id}`,
      body,
      headers
    );
  }

  updateUserRoles(body: any, authToken: string) {
    const headers: HttpHeaders = new HttpHeaders({
      'access-token': authToken
    });
    return this.globalService.patch(
      `${this.baseUrl}/V1/data/user/role`,
      body,
      headers
    );
  }
}
