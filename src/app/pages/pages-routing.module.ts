import { RouterModule, Routes } from '@angular/router';
import { CompaniesComponent } from './companies/companies.component';
import { ContactsComponent } from './contacts/contacts.component';
import { CountriesComponent } from './countries/countries.component';
import { NgModule } from '@angular/core';
import { UsersComponent } from './users/users.component';

const routes: Routes = [
  {
    path:'',
    children: [
      { path: 'countries', component: CountriesComponent },
      { path: 'contacts', component: ContactsComponent },
      { path: 'companies', component: CompaniesComponent },
      { path: 'users', component: UsersComponent },
      { path: '**', redirectTo:'contacts' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
