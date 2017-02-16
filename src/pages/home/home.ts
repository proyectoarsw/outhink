import { Component } from '@angular/core';

import { NavController, AlertController, ToastController, App, PopoverController } from 'ionic-angular';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';
import * as moment from "moment";

//import { BasePage } from '../base/base';

import { PopoverPage } from '../popover/popover';

import { Storage } from '@ionic/storage';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

http: Http;
start: String = new Date().toISOString();
end: String = new Date().toISOString();
contentHeader: Headers = new Headers({"Content-Type": "application/json"});
data : Array<any> = [];
logData : Array<any> = [];
initial : String =  new Date().toISOString();

public url:String = "https://watson-advisor.mybluemix.net/";

public totalCancelled : number = 0;

local: Storage = new Storage();

user:any = {};
client:any = {};


  constructor(private _app: App, public navCtrl: NavController, http: Http, public alertCtrl: AlertController, public toastCtrl: ToastController, public popoverCtrl: PopoverController) {
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
      }
    }).catch(error => {
      console.log(error);
    });
  }

    //LineChart
  public lineChartOptions:any={
    responsive: true,
              tooltips : {
            displayColors:false
          }
  };

  public lineChartLabels:string[] = ["Date1", "Date2", "Date3","Date4","Date5","Date6","Date7","Date8","Date9","Date10"];
  public lineChartType:string = "line";
  public lineChartLegend:boolean = false;
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
                        return tooltipItems.xLabel + ' ms';
                    }
                }
          },
          scales:{
            xAxes:[{
              ticks: {
                 beginAtZero: true,
                  callback: function(label, index, labels) {
                      return label+' ms';
                  }
              },
                scaleLabel: {
                    display: false,
                    labelString: 'Duration'
                }
            }],
            yAxes: [{
                stacked: true
            }]
          }
  };

  public chartLabels:string[] = ["Job1", "Job2", "Job3"];
  public chartType:string = "horizontalBar";
  public chartLegend:boolean = false;
  public chartData:any[] = [
    {data:[10,10,10], label: "Total duration (ms)"}
  ];

    public barChartColors:Array<any> = [
    { // green
      backgroundColor: 'rgba(34,139,34,0.6)',
      borderColor:'rgba(34,139,34,1)'
    }
  ];

  // pieChart
  public pieChartData:number[] = [1,1,1,1,1];
  public pieChartLabels:string[] = ["User1","User2","User3","User4","User5"];
  public pieChartOptions:any = {
    responsive: true,
          tooltips : {
                callbacks: {
                    label: function(tooltipItem, data) { 

                      return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] + " Jobs";
                    }
                }
          }
    
  };

  public pieChartLegend:boolean = true;
  public pieChartType:string = 'pie';

    // donChart
  public donChartData:number[] = [1,1,1,1,1];
  public donChartLabels:string[] = ["Job1","Job2","Job3","Job4","Job5"];
  public donChartOptions:any = {
    responsive: true,
          tooltips : {
                callbacks: {
                    label: function(tooltipItem, data) { 

                      return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] + " Jobs";
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

    this.start = moment(this.start).utc().startOf('day').format();
    this.end = moment(this.end).utc().endOf('day').format();

    this.updateBar();
    this.updatePie();
    this.updateDon();
    this.updateLine();
  }

  updateBar():void {
    
    var link = this.url +'jobchart';
    var data = JSON.stringify({start: this.start, end:this.end, client:this.client.name});
        
        this.http.post(link, data, { headers: this.contentHeader })
        .subscribe(data => {
         console.log(data.json());

         this.data = data.json().jobs;

         if(this.data.length > 0){

          var ar1 = [];
          var ar2 = [];

          this.data.forEach(function(job){
              ar1.push(job.duration);
              ar2.push(job.job_name);
          });

          
          this.chartLabels = ar2;
          setTimeout(()=>{this.chartData = [{data:ar1, label: "Total duration (ms)"}];}, 1000);
         
        }else{
            this.chartLabels = ["Job1", "Job2", "Job3"];
            setTimeout(()=>{this.chartData = [{data:[10,10,10], label: "Total duration (ms)"}];}, 1000);
        }

        this.logData = [];

        }, error => {
            console.log("Oooops!");
        });
        

  }
  
  updatePie():void {
    
    var link = this.url + 'jobchart2';
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
          this.pieChartLabels = ["User1","User2","User3","User4","User5"];
         setTimeout(()=>{this.pieChartData = [1,1,1,1,1]}, 1000);
        }
        }, error => {
            console.log("Oooops!");
        });

        
        

  }

    updateDon():void {
    
    var link = this.url+'jobchart3';
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

         
         this.donChartLabels = ar2;
         setTimeout(()=>{this.donChartData = ar1;}, 1000);

         }else{
          this.donChartLabels = ["Job1","Job2","Job3","Job4","Job5"];
         setTimeout(()=>{this.donChartData = [1,1,1,1,1]}, 1000);
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

/*
    // Go to login screen
  goLogin(){
    this._app.getRootNav().popToRoot();
                 }

    // Go to base screen
  goBase(){
    this._app.getRootNav().popTo(BasePage);
                 }

// Logout
 logout(){
   this.local.set('user', null);
   this.goLogin();
                }

                */

  // display menu
  displayMenu(event) {
        let popover = this.popoverCtrl.create(PopoverPage);
    popover.present({
      ev: event
    });
}


}
