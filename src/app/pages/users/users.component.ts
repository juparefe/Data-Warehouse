import * as XLSX from 'xlsx';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { ResponseServices } from 'src/app/interfaces/response.interface';
import { User } from 'src/app/interfaces/user.interface';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  authToken: string | null = '';
  countries: any[] = [];
  countriesByRegion: any[] = [];
  numberOfRowSelected = 0;
  numberOfRowSelectedArray: User[] = [];
  regions: any[] = [];
  responseMessage: string | null = null;
  selectedRows: boolean = false;
  selectedUsers: User[] = [];
  user = { userName: '', role: '' };
  users: User[] = [
    {
      id: undefined, selected: false, name: '', lastName: '', email: '', phone: '', country: '', region: '',
      address: '', userName: '', newsletter: false, role: ''
    }
  ];
  updateUserInfo!: FormGroup;

  constructor(private dataService: DataService, private userService: UsersService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.updateUserInfo = this.fb.group({
      'name': [null, [Validators.required, Validators.minLength(3)]],
      'lastName': [null, [Validators.required, Validators.minLength(3)]],
      'email': [null, [Validators.required, Validators.minLength(2)]],
      'phone': [null, [Validators.required, Validators.minLength(5), Validators.pattern(/^[0-9]*$/)]],
      'region': ['all', [Validators.required, Validators.pattern(/^(?!all$).*/)]],
      'country': ['all', [Validators.required, Validators.pattern(/^(?!all$).*/)]],
      'address': [null, [Validators.required, Validators.pattern(/^[A-Za-z0-9\s\-#,]+$/)]],
      'newsletter': [false, [Validators.required]],
      'role': [null, [Validators.required]],
      'id': [null, [Validators.required]]
    });
    this.authToken =sessionStorage.getItem('authToken');
    this.user =JSON.parse(sessionStorage.getItem('user') || '');
    if (this.authToken != null) {
      this.getUsers();
      this.getRegions();
      this.getCountries();
    }
  }

  deleteUser(indexArray: number, indexDB: number | undefined) {
    let jsonRes: ResponseServices;
    this.userService.deleteUser(indexDB, this.authToken || '')
      .subscribe({
        next: (res) => {
          jsonRes = JSON.parse(res);
          this.responseMessage = jsonRes.message;
          this.users.splice(indexArray, 1);
          this.restartBannerResponse();
        },
        error: (e) =>  {
          this.responseMessage = 'Ocurrió un error al eliminar el usuario.';
          this.restartBannerResponse();
        }
      });
  }

  // Función para exportar a Excel
  exportToExcel(data: any[]): void {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hoja1');
    XLSX.writeFile(workbook, 'Usuarios.xlsx');
  }

  // Función para exportar los elementos seleccionados
  exportSelectedToExcel(): void {
    this.getSelectedUsers();
    if (this.selectedUsers.length > 0) {
      this.exportToExcel(this.selectedUsers);
    } else {
      this.responseMessage = 'Debes seleccionar al menos un usuario para exportar.';
      this.restartBannerResponse();
    }
  }

  async fillForm(user: User) {
    this.updateUserInfo.patchValue(user);
    this.updateUserInfo.markAllAsTouched();
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
            this.updateUserInfo.controls['country'].setValue('all');
            this.updateUserInfo.controls['country'].markAsUntouched();
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

  getUsers() {
    let jsonRes: User[];
    this.userService.getUsers(this.user.userName || '')
      .subscribe({
        next: (res) => {
          if (res !== null) {
            jsonRes = JSON.parse(res);
          }
        },
        complete: () => {
          this.users = jsonRes;
          this.user = { userName: jsonRes[0].userName, role: jsonRes[0].role };
          if (this.user.role === 'Cliente') {
            this.fillForm(this.users[0]);
          }
        },
        error: (e) =>  {
          this.responseMessage = 'Ocurrió un error al intentar recuperar usuarios.';
          this.restartBannerResponse();
        }
      });
  }

  getSelectedUsers(): void {
    this.selectedUsers = this.users.filter((user) => user.selected);
  }

  restartBannerResponse(): void {
    setTimeout(() => {
      this.responseMessage = null;
    }, 3000);
  }

  saveNewRoles() {
    let jsonRes: ResponseServices;
    const users = this.selectedUsers.map(item => item.id);
    const role = this.selectedUsers[0].role;
    this.userService.updateUserRoles({ role, users }, this.authToken || '')
      .subscribe({
        next: (res) => {
          jsonRes = JSON.parse(res);
          this.responseMessage = jsonRes.message;
          this.selectedUsers = [];
          this.numberOfRowSelected = 0;
          this.restartBannerResponse();
        },
        complete: () => {
          this.getUsers();
        },
        error: (e) =>  {
          this.responseMessage = 'Ocurrió un error al actualizar los roles de usuario.';
          this.restartBannerResponse();
        }
      });
  }

  selectAllRows() {
    const allRowsSelected = this.users.every((item) => item.selected);
    const someRowSelected = this.users.some((item) => item.selected);
    if (allRowsSelected && !this.selectedRows) {
      this.selectedRows = false;
      this.users.forEach((item) => {
        item.selected = false;
      });
      this.numberOfRowSelected = 0;
    }
    else {
      if (someRowSelected && !this.selectedRows) {
        this.selectedRows = false;
        this.users.forEach((item) => {
          item.selected = false;
        });
        this.numberOfRowSelected = 0;
      } else {
        this.selectedRows = true;
        this.users.forEach((item) => {
          item.selected = true;
        });
        this.numberOfRowSelected = this.users.length;
      }
    }
  }

  selectSomeRows() {
    this.numberOfRowSelectedArray = this.users.filter((item) => item.selected);
    this.numberOfRowSelected = this.numberOfRowSelectedArray.length;
  }

  sortData(column: string): void {
    if (column === 'newsletter') {
      this.users.sort((a, b) => {
        return a.newsletter === b.newsletter ? 0 : a.newsletter ? -1 : 1;
      });
    } else {
      this.users.sort((a: any, b: any) => a[column].localeCompare(b[column]));
    }
  }

  updateCountryOptions(event: Event) {
    const selectedRegion = (event.target as HTMLSelectElement).value;
    if (selectedRegion != 'all' && this.authToken != null) {
      this.getCountriesByRegion(selectedRegion);
    } else {
      this.countriesByRegion = this.countries;
    }
  }

  updateRoles(role: string) {
    this.selectedUsers.forEach(user => {
      user.role = role;
    });
  }

  updateUser() {
    let jsonRes: ResponseServices;
    this.userService.updateUser(this.updateUserInfo.value, this.authToken || '')
      .subscribe({
        next: (res) => {
          jsonRes = JSON.parse(res);
          this.responseMessage = jsonRes.message;
          this.restartBannerResponse();
          this.getUsers();
        },
        error: (e) =>  {
          this.responseMessage = 'Ocurrió un error al actualizar el usuario.';
          this.restartBannerResponse();
        }
      });
  }

  validateField(field: string) {
    return this.updateUserInfo.controls[field].errors && this.updateUserInfo.controls[field].touched;
  }
}
