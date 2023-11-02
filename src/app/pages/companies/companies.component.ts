import * as XLSX from 'xlsx';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Company } from 'src/app/interfaces/company.interface';
import { Constants } from 'src/app/utilities/constants';
import { DataService } from 'src/app/services/data.service';
import { ResponseServices } from 'src/app/interfaces/response.interface';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent implements OnInit {

  authToken:string | null = '';
  companies: Company[] = [
    { id: undefined, selected: false, name: '', img: '', acronym: '', country: '', region: '', idNumber: '',
      size: '', address: '', phone: '', site: '', sector: '' }
  ];
  companiesToSave: Company[] = [];
  countries: any[] = [];
  countriesByRegion: any[] = [];
  fileAdd: any;
  fileUpdate: any;
  fileTooLarge: boolean = false;
  filters!: FormGroup;
  imageSrc: SafeUrl | undefined = '../../assets/dummy.png';
  imageSrcUpdate: SafeUrl | undefined = '../../assets/dummy.png';
  invalidImageType: boolean = false;
  newCompany!: FormGroup;
  numberOfRowSelected = 0;
  numberOfRowSelectedArray: Company[] = [];
  regions: any[] = [];
  responseMessage: string | null = null;
  rowsMapping = Constants.rowsMapping;
  sectors = Constants.sectors;
  selectedFilters: any[] = [];
  selectedRows: boolean = false;
  sizes = Constants.sizes;
  updateCompanyInfo!: FormGroup;

  constructor(private dataService: DataService, private fb: FormBuilder, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.filters = this.fb.group({
      'name': [null],
      'acronym': [null],
      'idNumber': [null],
      'size': ['all'],
      'sector': ['all'],
      'region': ['all'],
      'country': ['all']
    });
    this.newCompany = this.fb.group({
      'img': [Constants.base64Dummy],
      'name': [null, [Validators.required, Validators.minLength(3)]],
      'acronym': [null, [Validators.required, Validators.minLength(2)]],
      'idNumber': [null, [Validators.required, Validators.minLength(5), Validators.pattern(/^[0-9]*$/)]],
      'size': ['all', [Validators.required, Validators.pattern(/^(?!all$).*/)]],
      'region': ['all', [Validators.required, Validators.pattern(/^(?!all$).*/)]],
      'country': ['all', [Validators.required, Validators.pattern(/^(?!all$).*/)]],
      'address': [null, [Validators.required, Validators.pattern(/^[A-Za-z0-9\s\-#,]+$/)]],
      'phone': [null, [Validators.required, Validators.minLength(5), Validators.pattern(/^[0-9]*$/)]],
      'site': [null, [Validators.required, Validators.pattern(
        /^(https?:\/\/)?(www\.)?([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/
      )]],
      'sector': ['all', [Validators.required, Validators.pattern(/^(?!all$).*/)]]
    });
    this.updateCompanyInfo = this.fb.group({
      'name': [null, [Validators.required, Validators.minLength(3)]],
      'img': [null, [Validators.required]],
      'acronym': [null, [Validators.required, Validators.minLength(2)]],
      'idNumber': [null, [Validators.required, Validators.minLength(5), Validators.pattern(/^[0-9]*$/)]],
      'size': ['all', [Validators.required, Validators.pattern(/^(?!all$).*/)]],
      'region': ['all', [Validators.required, Validators.pattern(/^(?!all$).*/)]],
      'country': ['all', [Validators.required, Validators.pattern(/^(?!all$).*/)]],
      'address': [null, [Validators.required, Validators.pattern(/^[A-Za-z0-9\s\-#,]+$/)]],
      'phone': [null, [Validators.required, Validators.minLength(5), Validators.pattern(/^[0-9]*$/)]],
      'site': [null, [Validators.required, Validators.pattern(
        /^(https?:\/\/)?(www\.)?([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/
      )]],
      'sector': ['all', [Validators.required, Validators.pattern(/^(?!all$).*/)]],
      'id': [null, [Validators.required]]
    });
    this.authToken =sessionStorage.getItem('authToken');
    if (this.authToken != null) {
      this.getCompanies(this.authToken);
      this.getRegions();
      this.getCountries();
    }
  }

  addCompany() {
    let jsonRes: ResponseServices;
    const companyToSave = this.newCompany.value;
    this.dataService.addCompany(companyToSave, this.authToken || '')
      .subscribe({
        next: (res) => {
          jsonRes = JSON.parse(res);
          this.responseMessage = jsonRes.message;
          this.newCompany.reset({
            'size': 'all',
            'region': 'all',
            'country': 'all',
            'sector': 'all',
          });
          this.restartBannerResponse();
        },
        complete: () => {
          const newCompanyWithId = { id: jsonRes.result[0], ...companyToSave };
          this.companies.push(newCompanyWithId);
        },
        error: (e) =>  {
          console.error(e);
          this.responseMessage = 'Ocurrió un error al agregar la compañía.';
          this.restartBannerResponse();
        }
      });
  }

  addCompanies() {
    let jsonRes: ResponseServices;
    this.dataService.addCompanies(this.companiesToSave, this.authToken || '')
      .subscribe({
        next: (res) => {
          jsonRes = JSON.parse(res);
          this.responseMessage = jsonRes.message;
          this.restartBannerResponse();
        },
        complete: () => {
          for (let i = 0; i < this.companiesToSave.length; i++) {
            const company = this.companiesToSave[i];
            company.img = Constants.base64Dummy;
            company.id = jsonRes.result[i][0];
            this.companies.push(company);
          }
        },
        error: (e) =>  {
          console.error(e);
          this.responseMessage = 'Ocurrió un error al agregar las compañías.';
          this.restartBannerResponse();
        }
      });
  }

  applyFilters() {
    let jsonRes: Company[];
    this.dataService.applyFilters(this.selectedFilters, this.authToken || '')
      .subscribe({
        next: (res) => {
          if (res !== null) {
            jsonRes = JSON.parse(res);
          }
        },
        complete: () => {
          this.companies = jsonRes;
          this.filters.reset({
            'size': 'all',
            'region': 'all',
            'country': 'all',
            'sector': 'all',
          });
        },
        error: (e) => console.error(e)
      });
  }

  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = () => {
        reject(new Error('Error al convertir el Blob a base64'));
      };
      reader.readAsDataURL(blob);
    });
  }

  checkFilters(event: Event) {
    const name = (event.target as HTMLSelectElement).name;
    const filter = (event.target as HTMLSelectElement).value;
    this.selectedFilters.push({ filter, name });
  }

  compressImage(imagenComoArchivo: any, porcentajeCalidad: any): Promise<Blob> {
    const promise: Promise<Blob> = new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const imagen = new Image();
      imagen.onload = () => {
        canvas.width = imagen.width;
        canvas.height = imagen.height;
				canvas.getContext('2d')!.drawImage(imagen, 0, 0);
				canvas.toBlob(
				  (blob) => {
				    if (blob === null) {
				      return reject(blob);
				    } else {
				      resolve(blob);
				    }
				  },
				  'image/jpeg',
				  porcentajeCalidad / 100
				);
      };
      imagen.src = URL.createObjectURL(imagenComoArchivo);
    });
    return promise;
  }

  convertFileRowToObject(row: string) {
    const columns = ['name', 'acronym', 'country', 'region', 'idNumber', 'size', 'address', 'phone', 'site', 'sector'];
    // Dividir la fila en un array de valores
    const values = row.split(',');
    // Crear un objeto con los valores de la fila
    const object: any = {};
    for (let i = 0; i < values.length; i++) {
      object[columns[i]] = values[i].trim();
    }
    return object;
  }

  deleteCompany(indexArray: number, indexDB: number | undefined) {
    let jsonRes: ResponseServices;
    this.dataService.deleteCompany(indexDB, this.authToken || '')
      .subscribe({
        next: (res) => {
          jsonRes = JSON.parse(res);
          this.responseMessage = jsonRes.message;
          this.companies.splice(indexArray, 1);
          this.restartBannerResponse();
        },
        error: (e) =>  {
          console.error(e);
          this.responseMessage = 'Ocurrió un error al eliminar la compañía.';
          this.restartBannerResponse();
        }
      });
  }

  deleteCompanies() {
    let jsonRes: ResponseServices;
    this.dataService.deleteCompanies(this.numberOfRowSelectedArray, this.authToken || '')
      .subscribe({
        next: (res) => {
          jsonRes = JSON.parse(res);
          this.responseMessage = jsonRes.message;
          // Filtrar y mantener solo las compañías no seleccionadas
          this.companies = this.companies.filter(company => !company.selected);
          this.numberOfRowSelected = 0;
          this.restartBannerResponse();
        },
        error: (e) =>  {
          console.error(e);
          this.responseMessage = 'Ocurrió un error al eliminar las compañías.';
          this.restartBannerResponse();
        }
      });
  }

  // Función para exportar a Excel
  exportToExcel(data: any[]): void {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hoja1');
    XLSX.writeFile(workbook, 'Compañias.xlsx');
  }

  // Función para exportar los elementos seleccionados
  exportSelectedToExcel(): void {
    const selectedCompanies = this.companies.filter((company) => company.selected);
    if (selectedCompanies.length > 0) {
      this.exportToExcel(selectedCompanies);
    } else {
      this.responseMessage = 'Debes seleccionar al menos una compañia para exportar.';
      this.restartBannerResponse();
    }
  }

  async fillForm(company: Company) {
    this.imageSrcUpdate = company.img;
    this.updateCompanyInfo.patchValue(company);
    this.updateCompanyInfo.markAllAsTouched();
  }

  getCompanies(authToken: string) {
    let jsonRes: Company[];
    this.dataService.getCompanies(authToken)
      .subscribe({
        next: (res) => {
          if (res !== null) {
            jsonRes = JSON.parse(res);
          }
        },
        complete: () => {
          this.companies = jsonRes;
        },
        error: (e) =>  {
          console.error(e);
          this.responseMessage = 'Ocurrió un error al intentar recuperar las compañías.';
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
            this.newCompany.controls['country'].setValue('all');
            this.newCompany.controls['country'].markAsUntouched();
            this.updateCompanyInfo.controls['country'].setValue('all');
            this.updateCompanyInfo.controls['country'].markAsUntouched();
            this.filters.controls['country'].setValue('all');
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

  loadCSVFile(event: any) {
    if(event.target && event.target.files.length > 0) {
      const reader = new FileReader();
      reader.readAsText(event.target.files[0]);
      // Convertir el archivo CSV en un array de líneas
      reader.onload = (event) => {
        const lines = String(event.target!.result).split('\n');
        // Convertir el array de líneas en un array de objetos
        const objects = lines.map(this.convertFileRowToObject);
        this.companiesToSave = objects.slice(1, objects.length - 1);
      };
    };
  }

  async onFileImageChange(event: any, action: string) {
    const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png']; // Extensiones permitidas
    const maxSize = 0.5 * 1024 * 1024; // Tamaño máximo en bytes (0.5 MB)
    let file = event.target.files[0];
    if (file) {
      if (!allowedTypes.includes(file.type)) {
        this.invalidImageType = true;
      } else {
        this.invalidImageType = false;
      }
      if (file.size > maxSize) {
        this.fileTooLarge = true;
      } else {
        this.fileTooLarge = false;
      }
      const blob: any = await this.compressImage(file, 10);
      const blobBase64 = await this.blobToBase64(blob);
      if (action === 'save') {
        this.imageSrc = this.showImage(blob);
        this.newCompany.controls['img'].setValue(blobBase64);
      } else {
        this.imageSrcUpdate = this.showImage(blob);
        this.updateCompanyInfo.controls['img'].setValue(blobBase64);
      }
    }
  }

  removeFilter(index: number) {
    this.selectedFilters.splice(index, 1);
    this.applyFilters();
  }

  restartBannerResponse(): void {
    setTimeout(() => {
      this.responseMessage = null;
    }, 3000);
  }

  selectAllRows() {
    const allRowsSelected = this.companies.every((item) => item.selected);
    const someRowSelected = this.companies.some((item) => item.selected);
    if (allRowsSelected && !this.selectedRows) {
      this.selectedRows = false;
      this.companies.forEach((item) => {
        item.selected = false;
      });
      this.numberOfRowSelected = 0;
    }
    else {
      if (someRowSelected && !this.selectedRows) {
        this.selectedRows = false;
        this.companies.forEach((item) => {
          item.selected = false;
        });
        this.numberOfRowSelected = 0;
      } else {
        this.selectedRows = true;
        this.companies.forEach((item) => {
          item.selected = true;
        });
        this.numberOfRowSelected = this.companies.length;
      }
    }
  }

  selectSomeRows() {
    this.numberOfRowSelectedArray = this.companies.filter((item) => item.selected);
    this.numberOfRowSelected = this.numberOfRowSelectedArray.length;
  }

  showImage(blob: Blob): SafeUrl | undefined {
    if(blob) {
      const blobUrl = URL.createObjectURL(blob);
      return this.sanitizer.bypassSecurityTrustUrl(blobUrl);
    } else {
      return undefined;
    }
  }

  // Función para reorganizar los datos
  sortData(column: string): void {
    this.companies.sort((a: any, b: any) => a[column].localeCompare(b[column]));
  }

  updateCompany() {
    let jsonRes: ResponseServices;
    this.dataService.updateCompany(this.updateCompanyInfo.value, this.authToken || '')
      .subscribe({
        next: (res) => {
          jsonRes = JSON.parse(res);
          this.responseMessage = jsonRes.message;
          this.updateCompanyInfo.reset({
            'size': 'all',
            'region': 'all',
            'country': 'all',
            'sector': 'all',
          });
          this.restartBannerResponse();
          this.getCompanies(this.authToken || '');
        },
        error: (e) =>  {
          console.error(e);
          this.responseMessage = 'Ocurrió un error al actualizar la compañía.';
          this.restartBannerResponse();
        }
      });
  }

  updateCountryOptions(event: Event) {
    const selectedRegion = (event.target as HTMLSelectElement).value;
    if (selectedRegion != 'all' && this.authToken != null) {
      this.getCountriesByRegion(selectedRegion);
    } else {
      this.countriesByRegion = this.countries;
    }
  }

  validateField(field: string, action: string) {
    return action === 'save' ?
      this.newCompany.controls[field].errors && this.newCompany.controls[field].touched :
      this.updateCompanyInfo.controls[field].errors && this.updateCompanyInfo.controls[field].touched;
  }
}

