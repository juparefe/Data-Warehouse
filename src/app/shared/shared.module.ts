
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu/menu.component';
import { NgChartsModule } from 'ng2-charts';
import { NgModule } from '@angular/core';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    MenuComponent,
    BarChartComponent,
    PieChartComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    NgChartsModule
  ],
  exports: [
    BarChartComponent,
    MenuComponent,
    PieChartComponent,
  ]
})
export class SharedModule { }
