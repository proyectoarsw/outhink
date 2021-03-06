import { Component } from '@angular/core';

import { NavController, App, PopoverController } from 'ionic-angular';

import { Http, Headers } from '@angular/http';

import { ServicesProvider } from '../../providers/services/services';

import { PopoverPage } from '../popover/popover';
import 'rxjs/add/operator/map';
import * as moment from "moment";

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  http: Http;
  start: String = moment().subtract(1, "days").utc().format();
  end: String = moment().subtract(1, "days").utc().format();
  contentHeader: Headers = new Headers({ "Content-Type": "application/json" });
  data: Array<any> = [];
  initial: String = new Date().toISOString();

  color: String = 'rgb(255,255,255)';

  r: Number = 255;
  g: Number = 255;
  b: Number = 255;

  loading: boolean = false;

  user: any = {};
  client: any = {};

  selectedCheck = [];
  selected = [];

  public url: String = "https://watson-advisor.mybluemix.net/";



  constructor(public services: ServicesProvider, private _app: App, public navCtrl: NavController, http: Http, public popoverCtrl: PopoverController) {
    this.http = http;


    this.user = this.services.getUser();

    this.client = this.services.getCustomer();

    for (let elem of this.client.sids) {
      this.selectedCheck.push({ selected: true, sid: elem });
    };

    this.color = 'rgb(' + this.client.r + ',' + this.client.g + ',' + this.client.b + ')';
    this.r = this.client.r;
    this.g = this.client.g;
    this.b = this.client.b;

    this.updateChart();


  }


  //BarChart
  public chartOptions: any = {
    responsive: true,

    tooltips: {
      displayColors: false,
      titleFontSize: 0,
      callbacks: {
        label: function (tooltipItems, data) {
          return tooltipItems.xLabel.toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' KB';
        }
      }
    },
    scales: {
      xAxes: [{
        ticks: {
          beginAtZero: true,
          callback: function (label, index, labels) {
            return label + ' KB';
          }
        }
      }],
      yAxes: [{
        stacked: true
      }]
    }
  };

  public chartLabels: string[] = ["Tran1", "Tran2", "Tran3", "Tran4", "Tran5", "Tran6", "Tran7", "Tran8", "Tran9", "Tran10"];
  public chartType: string = "horizontalBar";
  public chartLegend: boolean = false;
  public chartData: any[] = [
    { data: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10], label: "Average Memory Usage (KB)" }
  ];

  public barChartColors: Array<any> = [
    { // green
      backgroundColor: 'rgba(34,139,34,0.6)',
      borderColor: 'rgba(34,139,34,1)'
    }
  ];

  //BarChart2

  public chartLabels2: string[] = ["Tran1", "Tran2", "Tran3", "Tran4", "Tran5"];
  public chartData2: any[] = [
    { data: [10, 10, 10, 10, 10], label: "Average Private Memory Usage (KB)" }
  ];


  // donChart
  public donChartData: number[] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  public donChartLabels: string[] = ["Tran1", "Tran2", "Tran3", "Tran4", "Tran5", "Tran6", "Tran7", "Tran8", "Tran9", "Tran10"];
  public donChartOptions: any = {
    responsive: true,
    tooltips: {
      callbacks: {
        label: function (tooltipItem, data) {

          return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].toLocaleString('de-DE', { maximumFractionDigits: 1 }) + " ms";
        }
      }
    }

  };

  public donChartLegend: boolean = true;
  public donChartType: string = 'doughnut';


  // Color
  public colors: Array<any> = [
    { // green
      backgroundColor: ['rgba(16,96,16,0.8)', 'rgba(0,160,66,0.8)', 'rgba(68,32,23,0.8)', 'rgba(62,74,65,0.8)', 'rgba(118,123,40,0.8)', 'rgba(181,182,118,0.8)', 'rgba(173,160,147,0.8)', 'rgba(154,205,50,0.8)', 'rgba(107,142,35,0.8)', 'rgba(50,205,50,0.8)', 'rgba(0,102,85,0.8)', 'rgba(136,181,136,0.8)']
    }
  ];


  public updateChart(): void {

    this.loading = true;

    // Check if there is something selected
    this.selected = [];
    var coun = 0;

    this.selectedCheck.forEach(function (elem) {
      if (elem.selected) { coun++ }
    });

    // Add sids

    if (coun > 0) {

      for (let elem of this.selectedCheck) {
        if (elem.selected) { this.selected.push(elem.sid) }
      };

    } else {
      for (let elem of this.selectedCheck) {
        elem.selected = true;
        this.selected.push(elem.sid);
      };
    }

    this.start = moment(this.start).utc().startOf('day').format();
    this.end = moment(this.end).utc().endOf('day').format();

    this.updateBar();
    this.updateBar2();
    this.updateDon();
  }

  updateBar(): void {

    var link = this.url + 'memorychart';
    var data = JSON.stringify({ start: this.start, end: this.end, client: this.client.name, sids: this.selected });

    this.http.post(link, data, { headers: this.contentHeader })
      .subscribe(data => {
        console.log(data.json());

        var dat = data.json().data;

        if (dat.length > 0) {

          var ar1 = [];
          var ar2 = [];

          dat.forEach(function (job) {
            ar1.push(job.value);
            ar2.push(job._id);
          });


          this.chartLabels = ar2;
          setTimeout(() => { this.chartData = [{ data: ar1, label: "Average Memory Usage (KB)" }]; }, 1000);

        } else {
          this.chartLabels = ["Tran1", "Tran2", "Tran3", "Tran4", "Tran5", "Tran6", "Tran7", "Tran8", "Tran9", "Tran10"];
          setTimeout(() => { this.chartData = [{ data: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10], label: "Average Memory Usage (KB)" }]; }, 1000);
        }

      }, error => {
        console.log("Oooops!");
      });


  }

  updateBar2(): void {

    var link = this.url + 'memorychart2';
    var data = JSON.stringify({ start: this.start, end: this.end, client: this.client.name, sids: this.selected });

    this.http.post(link, data, { headers: this.contentHeader })
      .subscribe(data => {
        console.log(data.json());

        var dat = data.json().data;

        if (dat.length > 0) {

          var ar1 = [];
          var ar2 = [];

          dat.forEach(function (job) {
            ar1.push(job.value);
            ar2.push(job._id);
          });


          this.chartLabels2 = ar2;
          setTimeout(() => { this.chartData2 = [{ data: ar1, label: "Average Private Memory Usage (KB)" }]; }, 1000);

        } else {
          this.chartLabels2 = ["Tran1", "Tran2", "Tran3", "Tran4", "Tran5"];
          setTimeout(() => { this.chartData2 = [{ data: [10, 10, 10, 10, 10], label: "Average Memory Private Usage (KB)" }]; }, 1000);
        }

      }, error => {
        console.log("Oooops!");
      });


  }

  updateDon(): void {

    var link = this.url + 'transchart';
    var data = JSON.stringify({ start: this.start, end: this.end, client: this.client.name, sids: this.selected });

    this.http.post(link, data, { headers: this.contentHeader })
      .subscribe(data => {
        console.log(data.json());

        var jobx = data.json().data;

        this.loading = false;

        if (jobx.length > 0) {

          var ar1 = [];
          var ar2 = [];

          jobx.forEach(function (job) {
            ar1.push(job.value);
            ar2.push(job._id);
          });


          this.donChartLabels = ar2;
          setTimeout(() => { this.donChartData = ar1; }, 1000);

        } else {
          this.donChartLabels = ["Tran1", "Tran2", "Tran3", "Tran4", "Tran5", "Tran6", "Tran7", "Tran8", "Tran9", "Tran10"];
          setTimeout(() => { this.donChartData = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }, 1000);
        }
      }, error => {
        console.log("Oooops!");
      });




  }


  // display menu
  displayMenu(event) {

    let popover = this.popoverCtrl.create(PopoverPage);
    popover.present({
      ev: event
    });
  }


}
