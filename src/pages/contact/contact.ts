import { Component } from '@angular/core';

import { NavController, App, PopoverController } from 'ionic-angular';

import {Http, Headers} from '@angular/http';
import { PopoverPage } from '../popover/popover';
//import { LoginPage } from '../login/login';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';
import * as moment from "moment";

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

http: Http;
start: String = new Date().toISOString();
end: String = new Date().toISOString();
contentHeader: Headers = new Headers({"Content-Type": "application/json"});
data : Array<any> = [];
errorData : Array<any> = [];
initial : String =  new Date().toISOString();

local: Storage = new Storage();

loading: boolean = false;

user:any = {};
client:any = {};

public totalDumps : number = 0;

public url:String = "https://watson-advisor.mybluemix.net/";


  constructor(private _app: App,public navCtrl: NavController, http: Http, public popoverCtrl: PopoverController) {
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
    responsive: true
  };

  public lineChartLabels:string[] = ["Date1", "Date2", "Date3","Date4","Date5","Date6","Date7","Date8","Date9","Date10"];
  public lineChartType:string = "line";
  public lineChartLegend:boolean = true;
  public lineChartData:any[] = [
    {data:[10,10,10,10,10,10,10,10,10,10], label: "Number of Dumps"}
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
                        return tooltipItems.xLabel + ' Dumps';
                    }
                }
          },
          scales:{
            xAxes:[{
              ticks: {
                 beginAtZero: true,
                  callback: function(label, index, labels) {
                      return label+'';
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

  public chartLabels:string[] = ["Program1", "Program2", "Program3", "Program4","Program5"];
  public chartType:string = "horizontalBar";
  public chartLegend:boolean = false;
  public chartData:any[] = [
    {data:[10,10,10,10,10], label: "Number of Dumps"}
  ];

    public barChartColors:Array<any> = [
    { // green
      backgroundColor: 'rgba(34,139,34,0.6)',
      borderColor:'rgba(34,139,34,1)'
    }
  ];

    //BarChart2

  public chartLabels2:string[] = ["Error1", "Error2", "Error3", "Error4","Error5"];
  public chartData2:any[] = [
    {data:[10,10,10,10,10], label: "Number of Dumps"}
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
  public donChartData:number[] = [1,1,1,1,1];
  public donChartLabels:string[] = ["Error1", "Error2", "Error3", "Error4","Error5"];
  public donChartOptions:any = {
    responsive: true
    
  };

  public donChartLegend:boolean = true;
  public donChartType:string = 'doughnut';
 
  // events
  public chartClicked(e:any):void {
    console.log(e);

    let clicked = e.active[0];

    if(clicked != null){
      let da = this.data[clicked._index];
      if(da != null){ 
        this.errorData = da;
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
    //this.updateDon();
    this.updateLine();
  }

  updateBar():void {
    
    var link = this.url+'dumpchart';
    var data = JSON.stringify({start: this.start, end:this.end, client:this.client.name});
        
        this.http.post(link, data, { headers: this.contentHeader })
        .subscribe(data => {
         console.log(data.json());

         var dat = data.json().dumps;

         if(dat.length > 0){

          var ar1 = [];
          var ar2 = [];

          dat.forEach(function(job){
              ar1.push(job.value);
              ar2.push(job._id);
          });

          
          this.chartLabels = ar2;
          setTimeout(()=>{this.chartData = [{data:ar1, label: "Number of Dumps"}];}, 1000);
         
        }else{
            this.chartLabels = ["Program1", "Program2", "Program3", "Program4","Program5"];
            setTimeout(()=>{this.chartData = [{data:[10,10,10,10,10], label: "Number of Dumps"}];}, 1000);
        }

        }, error => {
            console.log("Oooops!");
        });
        

  }

    updateBar2():void {
    
    var link = this.url+'dumpchart2';
    var data = JSON.stringify({start: this.start, end:this.end, client:this.client.name});
        
        this.http.post(link, data, { headers: this.contentHeader })
        .subscribe(data => {
         console.log(data.json());

         var dat = data.json().dumps;

         if(dat.length > 0){

          var ar1 = [];
          var ar2 = [];

          this.data = [];

          let t = this;

          var cou = 0;

          dat.forEach(function(job){
              ar1.push(job.value);
              ar2.push(job._id);
              
              //if(cou ==0){
              t.updateTable(job._id, cou);
              //}
              cou += 1;
          });

          
          this.chartLabels2 = ar2;
          setTimeout(()=>{this.chartData2 = [{data:ar1, label: "Number of Dumps"}];}, 1000);
         
        }else{
            this.chartLabels2 = ["Error1", "Error2", "Error3", "Error4","Error5"];
            setTimeout(()=>{this.chartData2 = [{data:[10,10,10,10,10], label: "Number of Dumps"}];}, 1000);
        }

        this.errorData = [];

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
    
    var link = this.url+'dumpchart2';
    var data = JSON.stringify({start: this.start, end:this.end, client:this.client.name});
        
        this.http.post(link, data, { headers: this.contentHeader })
        .subscribe(data => {
         console.log(data.json());

         var jobx = data.json().dumps;

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
          this.donChartLabels = ["Error1", "Error2", "Error3", "Error4","Error5"];
         setTimeout(()=>{this.donChartData = [1,1,1,1,1]}, 1000);
        }
        }, error => {
            console.log("Oooops!");
        });

        
        

  }

      updateLine():void {
    
    var link = this.url+'dumpchart3';
    var data = JSON.stringify({start: this.start, end:this.end, client:this.client.name});
        
        this.http.post(link, data, { headers: this.contentHeader })
        .subscribe(data => {
         console.log(data.json());

         var jobx = data.json().dumps;

         this.loading = false;

         if(jobx.length > 0){

         var ar1 = [];
         var ar2 = [];
         var tot = 0;

         jobx.forEach(function(job){
            ar1.push(job.value);
            ar2.push(moment(job._id).add(1,"day").format("D/M/YYYY"));
            tot += job.value;
         });

         this.totalDumps = tot;

         
         this.lineChartLabels = ar2;
         setTimeout(()=>{this.lineChartData = [{data: ar1, label: "Number of Dumps"}]}, 1000);

         }else{
          this.lineChartLabels = ["Date1", "Date2", "Date3","Date4","Date5","Date6","Date7","Date8","Date9","Date10"];
         setTimeout(()=>{this.lineChartData = [
    {data:[10,10,10,10,10,10,10,10,10,10], label: "Number of Dumps"}
         ]}, 1000);

         this.totalDumps = 0;
        }
        }, error => {
            console.log("Oooops!");
        });

        
      
  }

     updateTable(err,index):void {
    
    var link = this.url+'dumpchart4';
    var data = JSON.stringify({start: this.start, end:this.end, error:err, client:this.client.name});
        
        this.http.post(link, data, { headers: this.contentHeader })
        .subscribe(data => {
         console.log(data.json());

         var dat = data.json().dumps;

         dat.forEach(function(item){
           var da = moment(item._id).add(1,"day").format("D/M/YYYY");
           item._id = da;
         });

         this.data[index] = {error:err, data:dat};

  
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
    let ev = {
  target : {
    getBoundingClientRect : () => {
      return {
        right:'0',
        bottom:'0'
      };
    }
  }
};
        let popover = this.popoverCtrl.create(PopoverPage);
    popover.present({ev
    //  ev: event
    });
}

}
