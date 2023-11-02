import { Component } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {

  menuColor = 'bg-primary';
  menuOptions = [
    { name: 'Contactos', route: './data/contacts' },
    { name: 'Compañias', route: './data/companies' },
    { name: 'Usuarios', route: './data/users' },
    { name: 'Region/Pais', route: './data/countries' }
  ];

  constructor() { }

}
