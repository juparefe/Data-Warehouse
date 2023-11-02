import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgModule } from '@angular/core';
import { RatingModule } from 'primeng/rating';

@NgModule({
  declarations: [],
  exports: [
    ButtonModule,
    DialogModule,
    DropdownModule,
    MultiSelectModule,
    RatingModule
  ]
})
export class PrimeNgModule { }
