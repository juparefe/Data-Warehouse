import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit {

  @Input() chartId: string = '';
  @Input() horizontal: boolean = false;

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {},
      y: {
        ticks: {
          stepSize: 1 // Configurar la escala y para que vaya de 1 en 1
        }
      },
    },
    plugins: {
      legend: {
        display: true, // para tener la leyenda si o no
      }
    },
    indexAxis: 'x'
  };
  public barChartType: ChartType = 'bar';

  @Input() public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  constructor() { }

  ngOnInit(): void {
    this.barChartOptions!.indexAxis = this.horizontal ? 'y' : 'x';
  }
}
