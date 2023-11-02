import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ChartData } from 'chart.js';
import { Constants } from 'src/app/utilities/constants';
import { ReportsService } from 'src/app/services/reports.service';
import { User } from 'src/app/interfaces/user.interface';
import { UsersService } from 'src/app/services/users.service';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.scss']
})
export class CountriesComponent implements OnInit, AfterViewInit {

  authToken: string | null = '';
  baseUrl: string = Constants.baseUrl;
  chartCompaniesCountry: any;
  chartCompaniesRegion: any;
  chartCompaniesSector: any;
  chartContactsCompany: any;
  chartUsersCountry: any;
  chartUsersRegion: any;
  chartUsersSubscribed: any;
  dataCompaniesCountry: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  dataCompaniesRegion: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  dataCompaniesSector: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  dataContactsCompany: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  dataUsersCountry: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  dataUsersRegion: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  dataUsersSubscribed: ChartData<'pie'> = {
    labels: [],
    datasets: []
  };
  responseMessage: string | null = null;
  showCompaniesCountry = false;
  showCompaniesRegion = false;
  showCompaniesSector = false;
  showContactsCompany = false;
  showUsersCountry = false;
  showUsersRegion = false;
  showUsersSubscribed = false;
  user = { userName: '', role: '' };

  constructor(private reportService: ReportsService, private userService: UsersService) { }
  ngAfterViewInit(): void {
    this.chartCompaniesCountry = <HTMLCanvasElement>document.getElementById('chartTest');
    this.chartCompaniesRegion = '';
    this.chartCompaniesSector = '';
    this.chartContactsCompany = '';
    this.chartUsersCountry = '';
    this.chartUsersRegion = '';
    this.chartUsersSubscribed = '';
  }

  ngOnInit(): void {
    this.authToken =sessionStorage.getItem('authToken');
    this.user =JSON.parse(sessionStorage.getItem('user') || '');
    if (this.authToken != null) {
      this.getUsers();
    }
  }

  downloadChart(chartId: string) {
    const chartElement = document.getElementById(chartId) as HTMLElement;
    if (chartElement) {
      // Captura el gráfico como una imagen usando html2canvas
      html2canvas(chartElement).then((canvas) => {
        // Crea un objeto Blob a partir del canvas
        canvas.toBlob((blob) => {
          // Crea un enlace de descarga
          const url = blob ? window.URL.createObjectURL(blob) : '';
          const link = document.createElement('a');
          link.href = url;
          link.download = `${chartId}.png`; // Nombre del archivo de descarga
          link.click();
          // Libera la URL creada para el objeto Blob
          window.URL.revokeObjectURL(url);
        });
      });
    }
  }

  getChartData(endpoint: string) {
    let jsonRes: any[];
    return this.reportService.getChartData(this.authToken || '', endpoint)
      .subscribe({
        next: (res) => {
          if (res !== null) {
            jsonRes = JSON.parse(res);
          }
        },
        complete: () => {
          const labels = jsonRes.map((item) => item.label);
          const data = jsonRes.map((item) => parseFloat(item.data));
          const dataLabel = {
            labels,
            datasets: [
              { data, label: '' }
            ]
          };
          switch (true) {
          case endpoint.includes('users/region'):
            dataLabel.datasets[0].label = 'Número de usuarios';
            this.dataUsersRegion = dataLabel;
            break;
          case endpoint.includes('users/country'):
            dataLabel.datasets[0].label = 'Número de usuarios';
            this.dataUsersCountry = dataLabel;
            break;
          case endpoint.includes('users/subscribed'):
            dataLabel.datasets[0].label = 'Número de usuarios';
            this.dataUsersSubscribed = dataLabel;
            break;
          case endpoint.includes('companies/region'):
            dataLabel.datasets[0].label = 'Número de compañias';
            this.dataCompaniesRegion = dataLabel;
            break;
          case endpoint.includes('companies/country'):
            dataLabel.datasets[0].label = 'Número de compañias';
            this.dataCompaniesCountry = dataLabel;
            break;
          case endpoint.includes('companies/sector'):
            dataLabel.datasets[0].label = 'Número de compañias';
            this.dataCompaniesSector = dataLabel;
            break;
          case endpoint.includes('contacts/company'):
            dataLabel.datasets[0].label = 'Número de contactos';
            this.dataContactsCompany = dataLabel;
            break;
          default:
            break;
          };
        },
        error: (e) =>  {
          this.responseMessage = 'Ocurrió un error al intentar recuperar la informacion del reporte.';
          this.restartBannerResponse();
        }
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
          this.responseMessage = 'Ocurrió un error al intentar recuperar usuarios.';
          this.restartBannerResponse();
        }
      });
  }

  restartBannerResponse(): void {
    setTimeout(() => {
      this.responseMessage = null;
    }, 3000);
  }

  toggleChart(checked: boolean, chart: string) {
    switch (chart) {
    case 'CompaniesCountry':
      this.getChartData(`${this.baseUrl}/V1/reports/companies/country`);
      this.showCompaniesCountry = checked;
      break;
    case 'CompaniesRegion':
      this.getChartData(`${this.baseUrl}/V1/reports/companies/region`);
      this.showCompaniesRegion = checked;
      break;
    case 'CompaniesSector':
      this.getChartData(`${this.baseUrl}/V1/reports/companies/sector`);
      this.showCompaniesSector = checked;
      break;
    case 'ContactsCompany':
      this.getChartData(`${this.baseUrl}/V1/reports/contacts/company`);
      this.showContactsCompany = checked;
      break;
    case 'UsersCountry':
      this.getChartData(`${this.baseUrl}/V1/reports/users/country`);
      this.showUsersCountry = checked;
      break;
    case 'UsersRegion':
      this.getChartData(`${this.baseUrl}/V1/reports/users/region`);
      this.showUsersRegion = checked;
      break;
    case 'UsersSubscribed':
      this.getChartData(`${this.baseUrl}/V1/reports/users/subscribed`);
      this.showUsersSubscribed= checked;
      break;
    default:
      break;
    }
  }
}
