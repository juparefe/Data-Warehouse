import * as XLSX from 'xlsx';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Company } from 'src/app/interfaces/company.interface';
import { Constants } from 'src/app/utilities/constants';
import { Contact } from 'src/app/interfaces/contact.interface';
import { ContactsService } from 'src/app/services/contacts.service';
import { DataService } from 'src/app/services/data.service';
import { NgbProgressbarConfig } from '@ng-bootstrap/ng-bootstrap';
import { ResponseServices } from 'src/app/interfaces/response.interface';
import { User } from 'src/app/interfaces/user.interface';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {

  @ViewChild('multiSelectFilter') multiSelectFilter: any;
  @ViewChild('multiSelectAdd') multiSelectAdd: any;
  @ViewChild('multiSelectUpdate') multiSelectUpdate: any;
  authToken:string | null = '';
  channelOptions: string[];
  channels!: FormArray;
  countries: any[] = [];
  countriesByRegion: any[] = [];
  companies: Company[] = [
    { id: undefined, selected: false, name: '', img: '', acronym: '', country: '', region: '', idNumber: '', size: '',
      address: '', phone: '', site: '', sector: '' }
  ];
  contacts: Contact[] = [
    { id: undefined, selected: false, name: '', img: '', email: '', country: '', region: '', company: '', position: '',
      channels: [''], interestRate: 0 }
  ];
  contactsToSave: Contact[] = [];
  fileAdd: any;
  fileTooLarge: boolean = false;
  fileUpdate: any;
  filters!: FormGroup;
  imageSrc: SafeUrl | undefined = '../../assets/dummy.png';
  imageSrcUpdate: SafeUrl | undefined = '../../assets/dummy.png';
  interest: number = 0;
  invalidImageType: boolean = false;
  newContact!: FormGroup;
  numberOfRowSelected = 0;
  numberOfRowSelectedArray: Contact[] = [];
  regions: any[] = [];
  responseMessage: string | null = null;
  rowsMapping = Constants.rowsMapping;
  selectedChannels: any[] = [];;
  selectedFilters: any[] = [];
  selectedRows: boolean = false;
  selectedValue: number = 0;
  showDialog: boolean = false;
  updateContactInfo!: FormGroup;
  user = { userName: '', role: '' };

  checkFilters(event: any, name = 'other') {
    let filter = '';
    if (name === 'other') {
      name = (event.target as HTMLSelectElement).name;
      filter = (event.target as HTMLSelectElement).value;
    } else {
      filter = event.value;
      this.channels.push(this.fb.control(filter));
    }
    // Buscar si ya existe un filtro con el mismo nombre
    const existingFilterIndex = this.selectedFilters.findIndex(f => f.name === name);
    if (existingFilterIndex !== -1) {
      // Si ya existe, actualiza el valor existente
      this.selectedFilters[existingFilterIndex].filter = filter;
    } else {
      // Si no existe, agrega un nuevo filtro
      this.selectedFilters.push({ filter, name });
    }
  }

  constructor(
    config: NgbProgressbarConfig,
    private contactService: ContactsService,
    private dataService: DataService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private userService: UsersService
  ) {
    this.channelOptions = Constants.channels;
    config.max = 100;
  }

  ngOnInit(): void {
    this.channels = this.fb.array([]);
    this.filters = this.fb.group({
      'name': [null],
      'position': [null],
      'region': ['all'],
      'country': ['all'],
      'company': ['all'],
      'channels': this.channels
    });
    this.newContact = this.fb.group({
      'img': [Constants.base64Dummy],
      'name': [null, [Validators.required, Validators.minLength(3)]],
      'position': [null, [Validators.required, Validators.minLength(2)]],
      'email': [null, [Validators.required, Validators.email]],
      'region': ['all', [Validators.required, Validators.pattern(/^(?!all$).*/)]],
      'country': ['all', [Validators.required, Validators.pattern(/^(?!all$).*/)]],
      'company': ['all', [Validators.required, Validators.pattern(/^(?!all$).*/)]],
      'channels': [this.channels, [Validators.pattern(/^(?!\[\s*\]$)/)]],
      'interestRate': [5]
    });
    this.updateContactInfo = this.fb.group({
      'name': [null, [Validators.required, Validators.minLength(3)]],
      'img': [null, [Validators.required]],
      'position': [null, [Validators.required, Validators.minLength(2)]],
      'email': [null, [Validators.required, Validators.email]],
      'region': ['all', [Validators.required, Validators.pattern(/^(?!all$).*/)]],
      'country': ['all', [Validators.required, Validators.pattern(/^(?!all$).*/)]],
      'company': ['all', [Validators.required, Validators.pattern(/^(?!all$).*/)]],
      'channels': [this.channels, [Validators.pattern(/^(?!\[\s*\]$)/)]],
      'interestRate': [5],
      'id': [null, [Validators.required]]
    });
    this.authToken =sessionStorage.getItem('authToken');
    this.user =JSON.parse(sessionStorage.getItem('user') || '');
    if (this.authToken != null) {
      this.getContacts(this.authToken);
      this.getCompanies(this.authToken);
      this.getRegions();
      this.getCountries();
      this.getUsers();
    }
  }

  addContact() {
    let jsonRes: ResponseServices;
    const contactToSave = this.newContact.value;
    contactToSave.channels = contactToSave.channels.value ? contactToSave.channels.value : contactToSave.channels;
    contactToSave.channels = contactToSave.channels.flat();
    this.contactService.addContact(contactToSave, this.authToken || '')
      .subscribe({
        next: (res) => {
          jsonRes = JSON.parse(res);
          this.responseMessage = jsonRes.message;
          this.channels = this.fb.array([]);
          this.multiSelectAdd.value = [];
          this.multiSelectAdd.onChange.emit(this.multiSelectAdd.value);
          this.newContact.reset();
          this.newContact.patchValue({
            'img': Constants.base64Dummy,
            'region': 'all',
            'country': 'all',
            'company': 'all',
            'channels': this.channels
          });
          this.restartBannerResponse();
        },
        complete: () => {
          const newContactWithId = { id: jsonRes.result[0], ...contactToSave };
          this.contacts.push(newContactWithId);
        },
        error: (e) =>  {
          console.error(e);
          this.responseMessage = 'Ocurrió un error al agregar el contacto.';
          this.restartBannerResponse();
        }
      });
  }

  addContacts() {
    let jsonRes: ResponseServices;
    this.contactService.addContacts(this.contactsToSave, this.authToken || '')
      .subscribe({
        next: (res) => {
          jsonRes = JSON.parse(res);
          this.responseMessage = jsonRes.message;
          this.restartBannerResponse();
        },
        complete: () => {
          for (let i = 0; i < this.contactsToSave.length; i++) {
            const contact = this.contactsToSave[i];
            contact.img = Constants.base64Dummy;
            contact.id = jsonRes.result[i][0];
            contact.channels = JSON.parse(JSON.stringify(contact.channels));
            this.contacts.push(contact);
          }
        },
        error: (e) =>  {
          console.error(e);
          this.responseMessage = 'Ocurrió un error al agregar los contactos.';
          this.restartBannerResponse();
        }
      });
  }

  applyFilters() {
    let jsonRes: Contact[];
    this.contactService.applyFilters(this.selectedFilters, this.authToken || '')
      .subscribe({
        next: (res) => {
          if (res !== null) {
            jsonRes = JSON.parse(res);
          }
        },
        complete: () => {
          this.contacts = jsonRes;
          this.filters.reset({
            'region': 'all',
            'country': 'all',
            'company': 'all'
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
    const columns = ['name', 'email', 'country', 'region', 'company', 'position', 'channels', 'interestRate'];
    // Dividir la fila en un array de valores
    const values = row.split(';');
    // Crear un objeto con los valores de la fila
    const object: any = {};
    for (let i = 0; i < values.length; i++) {
      object[columns[i]] = columns[i] === 'channels' ? JSON.parse(values[i].trim()) : values[i].trim();
    }
    return object;
  }

  deleteContact(indexArray: number, indexDB: number | undefined) {
    let jsonRes: ResponseServices;
    this.contactService.deleteContact(indexDB, this.authToken || '')
      .subscribe({
        next: (res) => {
          jsonRes = JSON.parse(res);
          this.responseMessage = jsonRes.message;
          this.contacts.splice(indexArray, 1);
          this.restartBannerResponse();
        },
        error: (e) =>  {
          console.error(e);
          this.responseMessage = 'Ocurrió un error al eliminar el contacto.';
          this.restartBannerResponse();
        }
      });
  }

  deleteContacts() {
    let jsonRes: ResponseServices;
    this.contactService.deleteContacts(this.numberOfRowSelectedArray, this.authToken || '')
      .subscribe({
        next: (res) => {
          jsonRes = JSON.parse(res);
          this.responseMessage = jsonRes.message;
          // Filtrar y mantener solo los contactos no seleccionados
          this.contacts = this.contacts.filter(contact => !contact.selected);
          this.numberOfRowSelected = 0;
          this.restartBannerResponse();
        },
        error: (e) =>  {
          this.responseMessage = 'Ocurrió un error al eliminar los contactos.';
          this.restartBannerResponse();
        }
      });
  }

  exportToExcel(data: any[]): void {
    for (let i = 0; i < data.length; i++) {
      const contact = data[i];
      contact.channels = JSON.stringify(contact.channels);
    }
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hoja1');
    XLSX.writeFile(workbook, 'Contactos.xlsx');
  }

  exportSelectedToExcel(): void {
    const selectedContacts = this.contacts.filter((contact) => contact.selected);
    if (selectedContacts.length > 0) {
      this.exportToExcel(selectedContacts);
    } else {
      this.responseMessage = 'Debes seleccionar al menos un contacto para exportar.';
      this.restartBannerResponse();
    }
  }

  async fillForm(contact: Contact) {
    this.imageSrcUpdate = contact.img;
    // this.updateCountryOptions(contact.region, 'fillForm');
    // Para trabajar con un array de arrays
    // const channelsArray: string[] = contact.channels.map((innerArray) => innerArray[0]);
    const channelsArray: string[] = contact.channels;
    this.channels = this.fb.array(channelsArray);
    this.multiSelectUpdate.value = channelsArray;
    this.multiSelectUpdate.onChange.emit(channelsArray);
    this.updateContactInfo.reset(contact);
    this.updateContactInfo.patchValue({ 'country': contact.country });
    this.updateContactInfo.markAllAsTouched();
  }

  getArrayToUpdate(array: any[]) {
    const result: any[] = [];
    array.forEach((item) => {
      if (Array.isArray(item)) {
        // Si el elemento es un arreglo, llama a la función recursivamente
        const subArray = this.getArrayToUpdate(item);
        result.push(...subArray);
      } else {
        // Si el elemento no es un arreglo, agrégalo al resultado
        result.push(item);
      }
    });
    return result;
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

  getContacts(authToken: string) {
    let jsonRes: Contact[];
    this.contactService.getContacts(authToken)
      .subscribe({
        next: (res) => {
          if (res !== null) {
            jsonRes = JSON.parse(res);
          }
        },
        complete: () => {
          this.contacts = jsonRes;
        },
        error: (e) =>  {
          console.error(e);
          this.responseMessage = 'Ocurrió un error al intentar recuperar los contactos.';
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

  getCountriesByRegion(region: string, action: string) {
    this.dataService.getCountriesByRegion(region)
      .subscribe({
        next: (res) => {
          if (res !== null) {
            this.countriesByRegion = res;
            this.newContact.controls['country'].setValue('all');
            this.newContact.controls['country'].markAsUntouched();
            if (action !== 'fillForm') {
              this.updateContactInfo.controls['country'].setValue('all');
              this.updateContactInfo.controls['country'].markAsUntouched();
            }
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
          this.user = { userName: jsonRes[0].userName, role: jsonRes[0].role };
        },
        error: (e) =>  {
          console.error(e);
          this.responseMessage = 'Ocurrió un error al intentar recuperar usuarios.';
          this.restartBannerResponse();
        }
      });
  }

  isFilterArray(filter: any): boolean {
    return Array.isArray(filter);
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
        this.contactsToSave = objects.slice(1, objects.length - 1);
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
        this.newContact.controls['img'].setValue(blobBase64);
      } else {
        this.imageSrcUpdate = this.showImage(blob);
        this.updateContactInfo.controls['img'].setValue(blobBase64);
      }
    }
  }

  removeFilter(index: number) {
    const filter = this.selectedFilters[index];
    if (filter.name && filter.name === 'channels') {
      this.multiSelectFilter.value = [];
      this.multiSelectFilter.onChange.emit(this.multiSelectFilter.value);
    }
    this.selectedFilters.splice(index, 1);
    this.applyFilters();
  }

  restartBannerResponse(): void {
    setTimeout(() => {
      this.responseMessage = null;
    }, 3000);
  }

  selectAllRows() {
    const allRowsSelected = this.contacts.every((item) => item.selected);
    const someRowSelected = this.contacts.some((item) => item.selected);
    if (allRowsSelected && !this.selectedRows) {
      this.selectedRows = false;
      this.contacts.forEach((item) => {
        item.selected = false;
      });
      this.numberOfRowSelected = 0;
    }
    else {
      if (someRowSelected && !this.selectedRows) {
        this.selectedRows = false;
        this.contacts.forEach((item) => {
          item.selected = false;
        });
        this.numberOfRowSelected = 0;
      } else {
        this.selectedRows = true;
        this.contacts.forEach((item) => {
          item.selected = true;
        });
        this.numberOfRowSelected = this.contacts.length;
      }
    }
  }

  selectSomeRows() {
    this.numberOfRowSelectedArray = this.contacts.filter((item) => item.selected);
    this.numberOfRowSelected = this.numberOfRowSelectedArray.length;
  }

  setChannels(event: any) {
    if (event && event.value) {
      const channelsArray = this.channels.getRawValue();
      if (channelsArray.length > 0) {
        channelsArray.forEach(channel => {
          event.value = event.value.filter((item: any) => !channel.includes(item));
        });
      }
      this.channels.push(this.fb.control(event.value));
    }
  }

  showImage(blob: Blob): SafeUrl | undefined {
    if(blob) {
      const blobUrl = URL.createObjectURL(blob);
      return this.sanitizer.bypassSecurityTrustUrl(blobUrl);
    } else {
      return undefined;
    }
  }

  sortData(column: string): void {
    this.contacts.sort((a: any, b: any) => a[column].localeCompare(b[column]));
  }

  updateCountryOptions(event: Event | string, action: string) {
    const selectedRegion = typeof(event) !== 'string' ? (event.target as HTMLSelectElement).value : event;
    if (selectedRegion != 'all' && this.authToken != null) {
      this.getCountriesByRegion(selectedRegion, action);
    } else {
      this.countriesByRegion = this.countries;
    }
  }

  updateContact() {
    let jsonRes: ResponseServices;
    const fixedChannels = this.getArrayToUpdate(this.channels.getRawValue());
    const contactToUpdate = this.updateContactInfo.value;
    contactToUpdate.channels = fixedChannels;
    this.contactService.updateContact(contactToUpdate, this.authToken || '')
      .subscribe({
        next: (res) => {
          jsonRes = JSON.parse(res);
          this.responseMessage = jsonRes.message;
          this.channels = this.fb.array([]);
          this.multiSelectUpdate.value = [];
          this.multiSelectUpdate.onChange.emit(this.multiSelectAdd.value);
          this.updateContactInfo .reset({
            'region': 'all',
            'country': 'all',
            'company': 'all',
            'interestRate': 5
          });
          this.restartBannerResponse();
          this.getContacts(this.authToken || '');
        },
        error: (e) =>  {
          console.error(e);
          this.responseMessage = 'Ocurrió un error al actualizar el contacto.';
          this.restartBannerResponse();
        }
      });
  }

  // updateRangeValue(event: Event, rangeToUpdate: string) {
  //   const target = event.target as HTMLInputElement;
  //   const rangeValue = document.getElementById(rangeToUpdate);
  //   if (rangeValue) {
  //     console.log('rangeValue', rangeValue)
  //     rangeValue.textContent = `${target.value}%`;
  //   }
  //   if (rangeToUpdate === 'rangeValueUpdate') {
  //     this.updateContactInfo.get('interestRate')!.setValue(target.value);
  //   } else {
  //     this.newContact.get('interestRate')!.setValue(target.value);
  //   }
  // }

  updateRangeValue(event: Event) {
    console.log('event', event);
    console.log('newContact', this.newContact);
    console.log('newContact Invalid', this.newContact.invalid);
    console.log('newContact Errors', this.newContact.errors);
  }

  validateField(field: string, action: string) {
    return action === 'save' ?
      this.newContact.controls[field].errors && this.newContact.controls[field].touched :
      this.updateContactInfo.controls[field].errors && this.updateContactInfo.controls[field].touched;
  }
}
