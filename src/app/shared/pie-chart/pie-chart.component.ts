import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent {

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: { display: false },
      y: { display: false },
    },
    plugins: {
      legend: {
        display: true, // para tener la leyenda si o no
      }
    },
    indexAxis: 'x'
  };
  public pieChartType: ChartType = 'pie';

  @Input() chartId: string = '';
  @Input() public pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: []
  };

  constructor() { }

}
