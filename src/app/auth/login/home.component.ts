import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth } from 'src/app/interfaces/auth.interface';
import { AuthService } from '../../services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { EmailService } from 'src/app/services/email.service';
import { ResponseServices } from 'src/app/interfaces/response.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  authInfo: Auth = {
    username: '',
    password: ''
  };
  countries: any[] = [];
  countriesByRegion: any[] = [];
  forgottenPassword!: FormGroup;
  errorMessage: string | undefined = undefined;
  registerUserInfo!: FormGroup;
  regions: any[] = [];
  responseMessage: string | null = null;;
  responseValue: any;

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private emailService: EmailService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.forgottenPassword = this.fb.group({
      'username': '',
      'email': ''
    });
    this.registerUserInfo = this.fb.group({
      'name': [null, [Validators.required, Validators.minLength(3)]],
      'lastName': [null, [Validators.required, Validators.minLength(3)]],
      'email': [null, [Validators.required, Validators.email]],
      'phone': [null, [Validators.required, Validators.minLength(5), Validators.pattern(/^[0-9]*$/)]],
      'country': ['all', [Validators.required, Validators.pattern(/^(?!all$).*/)]],
      'region': ['all', [Validators.required, Validators.pattern(/^(?!all$).*/)]],
      'address': [null, [Validators.required, Validators.pattern(/^[A-Za-z0-9\s\-#,]+$/)]],
      'username': [null, [Validators.required, Validators.minLength(3)]],
      'password': [null, [Validators.required, Validators.minLength(3)]],
      'newsletter': [false, []],
      'terms': [false, [Validators.requiredTrue]]
    });
    this.getRegions();
    this.getCountries();
  }

  addUser() {
    let jsonRes: ResponseServices;
    const userToSave = this.registerUserInfo.value;
    this.authService.addUser(userToSave)
      .subscribe({
        next: (res) => {
          jsonRes = JSON.parse(res);
          this.responseMessage = jsonRes.message;
          this.registerUserInfo.reset({
            'region': 'all',
            'country': 'all',
          });
          this.restartBannerResponse();
        },
        error: (e) =>  {
          console.error(e);
          this.responseMessage = 'Ocurrió un error al crear el nuevo usuario.';
          this.restartBannerResponse();
        }
      });
  }

  async buildEmail() {
    let jsonRes: ResponseServices;
    this.emailService.sendEmail(this.forgottenPassword.value)
      .subscribe({
        next: (res) => {
          if (res !== null) {
            jsonRes = JSON.parse(res);
            this.responseMessage = jsonRes.message;
            this.forgottenPassword.reset();
            this.restartBannerResponse();
          }
        },
        error: (e) =>  {
          console.error(e);
          this.responseMessage = 'Ocurrió un error al recuperar la contraseña del usuario.';
          this.restartBannerResponse();
        }
      });
  }

  getCountries() {
    this.dataService.getCountries()
      .subscribe({
        next: (res) => {
          if (res !== null) {
            this.countries = res;
            this.countriesByRegion = res;
          }
        },
        error: (e) => console.error(e)
      });
  }

  getCountriesByRegion(region: string) {
    this.dataService.getCountriesByRegion(region)
      .subscribe({
        next: (res) => {
          if (res !== null) {
            this.countriesByRegion = res;
            this.registerUserInfo.controls['country'].setValue('all');
            this.registerUserInfo.controls['country'].markAsUntouched();
          }
        },
        error: (e) => console.error(e)
      });
  }

  getRegions() {
    this.dataService.getRegions()
      .subscribe({
        next: (res) => {
          if (res !== null) {
            this.regions = res;
          }
        },
        error: (e) => console.error(e)
      });
  }

  login() {
    const user = JSON.stringify({ userName: this.authInfo.username, role: '' });
    sessionStorage.setItem('user', user);
    this.authService.login(this.authInfo)
      .subscribe({
        next: (res) => {
          if (res !== null) {
            this.responseValue = res;
          }
        },
        complete: () => {
          if (this.responseValue && JSON.parse(this.responseValue).authToken) {
            this.errorMessage = undefined;
            sessionStorage.setItem('authToken', JSON.parse(this.responseValue).authToken);
            this.router.navigate(['./data']);
          } else {
            this.showErrorMessage('Usuario o contraseña incorrectos');
          }
        },
        error: (e) => console.error(e)
      });
  }

  restartBannerResponse(): void {
    setTimeout(() => {
      this.responseMessage = null;
    }, 3000);
  }

  private showErrorMessage(message: string): void {
    this.errorMessage = message;
  }

  updateCountryOptions(event: Event) {
    const selectedRegion = (event.target as HTMLSelectElement).value;
    if (selectedRegion != 'all') {
      this.getCountriesByRegion(selectedRegion);
    } else {
      this.countriesByRegion = this.countries;
    }
  }

  validateField(field: string, action: string) {
    return action === 'save' ?
      this.registerUserInfo.controls[field].touched && this.registerUserInfo.controls[field].errors :
      this.forgottenPassword.controls[field].touched && this.forgottenPassword.controls[field].errors;
  }
}
