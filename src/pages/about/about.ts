import { Component } from '@angular/core';

import { NavController, App, PopoverController } from 'ionic-angular';

import {Http, Headers} from '@angular/http';
import { Storage } from '@ionic/storage';
//import { BasePage } from '../base/base';

import { PopoverPage } from '../popover/popover';
//import { LoginPage } from '../login/login';
import 'rxjs/add/operator/map';
import * as moment from "moment";

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

http: Http;
start: String = moment().subtract(1,"days").utc().format();
end: String = moment().subtract(1,"days").utc().format();
contentHeader: Headers = new Headers({"Content-Type": "application/json"});
data : Array<any> = [];
logData : Array<any> = [];
initial : String =  new Date().toISOString();

color : String = 'rgb(255,255,255)';

r: Number = 255;
g:Number = 255;
b: Number = 255;


local: Storage = new Storage();
loading: boolean = false;

user:any = {};
client:any = {};

public totalCancelled : number = 0;

public url:String = "https://watson-advisor.mybluemix.net/";



  constructor(private _app: App, public navCtrl: NavController, http: Http, public popoverCtrl: PopoverController) {
    this.http = http;

    this.local.get('user').then(token => {
      if(token){
        this.user = token;
      }
    }).catch(error => {
      console.log(error);
    });

        this.local.get('client').then(token => {
      if(token){
        this.client = token;

        this.color = 'rgb('+ token.r +','+token.g+','+token.b+')';
        this.r = token.r;
        this.g = token.g;
        this.b = token.b;

        this.updateChart();
      }
    }).catch(error => {
      console.log(error);
    });

    

  }

    //LineChart
  public lineChartOptions:any={
    responsive: true
  };

  public lineChartLabels:string[] = ["Date1", "Date2", "Date3","Date4","Date5","Date6","Date7","Date8","Date9","Date10"];
  public lineChartType:string = "line";
  public lineChartLegend:boolean = true;
  public lineChartData:any[] = [
    {data:[10,10,10,10,10,10,10,10,10,10], label: "Cancelled jobs"}
  ];

  public lineChartColors:Array<any> = [
    { // green
      backgroundColor: 'rgba(34,139,34,0.2)',
      borderColor: 'rgba(34,139,34,1)',
      pointBackgroundColor: 'rgba(34,139,34,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(34,139,34,0.8)'
    }
  ];
  //BarChart
  public chartOptions:any={
    responsive: true,

          tooltips : {
            displayColors:false,
            titleFontSize:0,
                callbacks: {
                    label: function(tooltipItems, data) { 
                        return tooltipItems.xLabel + ' KB';
                    }
                }
          },
            scales: {
            xAxes: [{
              ticks: {
                  beginAtZero: true,
                  callback: function(label, index, labels) {
                      return label+' KB';
                  }
              }
            }],
            yAxes: [{
                stacked: true
            }]
        }
  };

  public chartLabels:string[] = ["Tran1", "Tran2", "Tran3", "Tran4","Tran5","Tran6","Tran7","Tran8","Tran9","Tran10"];
  public chartType:string = "horizontalBar";
  public chartLegend:boolean = false;
  public chartData:any[] = [
    {data:[10,10,10,10,10,10,10,10,10,10], label: "Average Memory Usage (KB)"}
  ];

    public barChartColors:Array<any> = [
    { // green
      backgroundColor: 'rgba(34,139,34,0.6)',
      borderColor:'rgba(34,139,34,1)'
    }
  ];

    //BarChart2

  public chartLabels2:string[] = ["Tran1", "Tran2", "Tran3", "Tran4","Tran5"];
  public chartData2:any[] = [
    {data:[10,10,10,10,10], label: "Average Private Memory Usage (KB)"}
  ];

  // pieChart
  public pieChartData:number[] = [1,1,1,1,1,1,1,1,1,1];
  public pieChartLabels:string[] = ["User1","User2","User3","User4","User5","User6","User7","User8","User9","User10"];
  public pieChartOptions:any = {
    responsive: true
    
  };

  public pieChartLegend:boolean = true;
  public pieChartType:string = 'pie';

    // donChart
  public donChartData:number[] = [1,1,1,1,1,1,1,1,1,1];
  public donChartLabels:string[] = ["Tran1", "Tran2", "Tran3", "Tran4","Tran5","Tran6","Tran7","Tran8","Tran9","Tran10"];
  public donChartOptions:any = {
    responsive: true,
          tooltips : {
                callbacks: {
                    label: function(tooltipItem, data) { 

                      return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] + " ms";
                    }
                }
          }
    
  };

  public donChartLegend:boolean = true;
  public donChartType:string = 'doughnut';


    // Color
    public colors:Array<any> = [
    { // green
      backgroundColor: ['rgba(16,96,16,0.8)','rgba(0,160,66,0.8)','rgba(68,32,23,0.8)','rgba(62,74,65,0.8)','rgba(118,123,40,0.8)','rgba(181,182,118,0.8)','rgba(173,160,147,0.8)','rgba(154,205,50,0.8)','rgba(107,142,35,0.8)','rgba(50,205,50,0.8)','rgba(0,102,85,0.8)','rgba(136,181,136,0.8)']
    }
  ];
 
  // events
  public chartClicked(e:any):void {
    console.log(e);

    let clicked = e.active[0];

    if(clicked != null){
      let da = this.data[clicked._index];
      if(da != null){ 
        this.logData = da.log;
      }
    }

  }
 
  public chartHovered(e:any):void {
    //console.log(e);
  }  

  public updateChart():void {

    this.loading = true;

    this.start = moment(this.start).utc().startOf('day').format();
    this.end = moment(this.end).utc().endOf('day').format();

    this.updateBar();
    this.updateBar2();
   // this.updatePie();
    this.updateDon();
   // this.updateLine();
  }

  updateBar():void {
    
    var link = this.url+'memorychart';
    var data = JSON.stringify({start: this.start, end:this.end, client:this.client.name});
        
        this.http.post(link, data, { headers: this.contentHeader })
        .subscribe(data => {
         console.log(data.json());

         var dat = data.json().trans;

         if(dat.length > 0){

          var ar1 = [];
          var ar2 = [];

          dat.forEach(function(job){
              ar1.push(job.value);
              ar2.push(job._id);
          });

          
          this.chartLabels = ar2;
          setTimeout(()=>{this.chartData = [{data:ar1, label: "Average Memory Usage (KB)"}];}, 1000);
         
        }else{
            this.chartLabels = ["Tran1", "Tran2", "Tran3", "Tran4","Tran5","Tran6","Tran7","Tran8","Tran9","Tran10"];
            setTimeout(()=>{this.chartData = [{data:[10,10,10,10,10,10,10,10,10,10], label: "Average Memory Usage (KB)"}];}, 1000);
        }

        this.logData = [];

        }, error => {
            console.log("Oooops!");
        });
        

  }

    updateBar2():void {
    
    var link = this.url+'memorychart2';
    var data = JSON.stringify({start: this.start, end:this.end, client:this.client.name});
        
        this.http.post(link, data, { headers: this.contentHeader })
        .subscribe(data => {
         console.log(data.json());

         var dat = data.json().trans;

         if(dat.length > 0){

          var ar1 = [];
          var ar2 = [];

          dat.forEach(function(job){
              ar1.push(job.value);
              ar2.push(job._id);
          });

          
          this.chartLabels2 = ar2;
          setTimeout(()=>{this.chartData2 = [{data:ar1, label: "Average Private Memory Usage (KB)"}];}, 1000);
         
        }else{
            this.chartLabels2 = ["Tran1", "Tran2", "Tran3", "Tran4","Tran5"];
            setTimeout(()=>{this.chartData2 = [{data:[10,10,10,10,10], label: "Average Memory Private Usage (KB)"}];}, 1000);
        }

        this.logData = [];

        }, error => {
            console.log("Oooops!");
        });
        

  }
  
  updatePie():void {
    
    var link = this.url+'jobchart2';
    var data = JSON.stringify({start: this.start, end:this.end, client:this.client.name});
        
        this.http.post(link, data, { headers: this.contentHeader })
        .subscribe(data => {
         console.log(data.json());

         var jobx = data.json().jobs;

         if(jobx.length > 0){

         var ar1 = [];
         var ar2 = [];

         jobx.forEach(function(job){
            ar1.push(job.value);
            ar2.push(job._id);
         });

         
         this.pieChartLabels = ar2;
         setTimeout(()=>{this.pieChartData = ar1;}, 1000);

         }else{
          this.pieChartLabels = ["User1","User2","User3","User4","User5","User6","User7","User8","User9","User10"];
         setTimeout(()=>{this.pieChartData = [1,1,1,1,1,1,1,1,1,1]}, 1000);
        }
        }, error => {
            console.log("Oooops!");
        });

        
        

  }

    updateDon():void {
    
    var link = this.url+'transchart';
    var data = JSON.stringify({start: this.start, end:this.end, client:this.client.name});
        
        this.http.post(link, data, { headers: this.contentHeader })
        .subscribe(data => {
         console.log(data.json());

         var jobx = data.json().trans;

         this.loading =false;

         if(jobx.length > 0){

         var ar1 = [];
         var ar2 = [];

         jobx.forEach(function(job){
            ar1.push(job.value);
            ar2.push(job._id);
         });

         
         this.donChartLabels = ar2;
         setTimeout(()=>{this.donChartData = ar1;}, 1000);

         }else{
          this.donChartLabels = ["Tran1", "Tran2", "Tran3", "Tran4","Tran5","Tran6","Tran7","Tran8","Tran9","Tran10"];
         setTimeout(()=>{this.donChartData = [1,1,1,1,1,1,1,1,1,1]}, 1000);
        }
        }, error => {
            console.log("Oooops!");
        });

        
        

  }

      updateLine():void {
    
    var link = this.url+'jobchart4';
    var data = JSON.stringify({start: this.start, end:this.end, client:this.client.name});
        
        this.http.post(link, data, { headers: this.contentHeader })
        .subscribe(data => {
         console.log(data.json());

         var jobx = data.json().jobs;

         if(jobx.length > 0){

         var ar1 = [];
         var ar2 = [];
         var tot = 0;

         jobx.forEach(function(job){
            ar1.push(job.value);
            ar2.push(moment(job._id).add(1,"day").format("D/M/YYYY"));
            tot += job.value;
         });

         this.totalCancelled = tot;

         
         this.lineChartLabels = ar2;
         setTimeout(()=>{this.lineChartData = [{data: ar1, label: "Cancelled jobs"}]}, 1000);

         }else{
          this.lineChartLabels = ["Date1", "Date2", "Date3","Date4","Date5","Date6","Date7","Date8","Date9","Date10"];
         setTimeout(()=>{this.lineChartData = [
    {data:[10,10,10,10,10,10,10,10,10,10], label: "Cancelled jobs"}
         ]}, 1000);

         this.totalCancelled = 0;
        }
        }, error => {
            console.log("Oooops!");
        });

        
        

  }


  // display menu
  displayMenu(event) {
/*
let ev = {
  target : {
    getBoundingClientRect : () => {
      return {
        right:'0',
        bottom:'0'
      };
    }
  }
};*/

        let popover = this.popoverCtrl.create(PopoverPage);
    popover.present({ 
      ev: event
    });
}


}
