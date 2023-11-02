import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BooleanPipe } from '../pipes/boolean.pipe';
import { CommonModule } from '@angular/common';
import { CompaniesComponent } from './companies/companies.component';
import { ContactsComponent } from './contacts/contacts.component';
import { CountriesComponent } from './countries/countries.component';
import { NgChartsModule } from 'ng2-charts';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PagesRoutingModule } from './pages-routing.module';
import { PrimeNgModule } from '../prime-ng/prime-ng.module';
import { SharedModule } from '../shared/shared.module';
import { UsersComponent } from './users/users.component';

@NgModule({
  declarations: [
    CountriesComponent,
    CompaniesComponent,
    ContactsComponent,
    UsersComponent,
    BooleanPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    NgChartsModule,
    PagesRoutingModule,
    PrimeNgModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class PagesModule { }
