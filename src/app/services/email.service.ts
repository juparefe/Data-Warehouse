import { Constants } from '../utilities/constants';
import { Injectable } from '@angular/core';
import { globalServiceRequests } from './global/global.service';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private baseUrl: string = Constants.baseUrl;

  constructor(private globalServiceRequests: globalServiceRequests) { }

  sendEmail(body: any) {
    return this.globalServiceRequests.post(
      `${this.baseUrl}/V1/auth/forgotten-password-resend`,
      body
    );
  }
}
