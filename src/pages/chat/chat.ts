import { Component, ViewChild } from '@angular/core';
import { NavController, AlertController, ToastController, App, PopoverController } from 'ionic-angular';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';
import * as moment from "moment";
import {Validators, FormBuilder } from '@angular/forms';
import { PopoverPage } from '../popover/popover';

import { Storage } from '@ionic/storage';

/*
  Generated class for the Chat page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
  queries: {
    content: new ViewChild('content')
  }
})
export class ChatPage {

  content = document.getElementById("content");

http: Http;
start: String = moment().subtract(1,"days").format("YYYY-MM-DDTHH:mm");
end: String = moment().subtract(1,"days").format("YYYY-MM-DDTHH:mm");
contentHeader: Headers = new Headers({"Content-Type": "application/json"});
data : Array<any> = [];

public form: any;

color : String = 'rgb(255,255,255)';

r: Number = 255;
g:Number = 255;
b: Number = 255;

public url:String = "https://watson-advisor.mybluemix.net/";

local: Storage = new Storage();

loading: boolean = false;

user:any = {};
client:any = {};

selected = [];

//message: String = "";
messages = [{text:"Hello I'm Watson, what do you need ?", resp:true}];

// Chart variables

showBigNumber: boolean = false;
bigNumber = 0;

showLineChart: boolean = false;
//lineChartData: Array<any> = [];

showBarChart: boolean = false;
//barChartData: Array<any> = [];

showDoughnutChart: boolean = false;
//doughnutChartData: Array<any> = [];

queryCustomer = "";

usingLocalConversation = false;

ot = "";

chatInput = "";

ots = {"DEVK9A06MY" : [{"datetime":"2017-04-03 12:12:47","rn":"1491239054","sys":"PRD","req":"DEVK9A06MY","clt":"400","own":"jicorred@co.ibm.com","ans":"SUCCESS to import order.","rc":"0","tl":"OK (Return Code = 0)","cus":"CAFAM"}],
"ED1K912629" : [{"datetime":"2017-04-03 15:21:33","rn":"1491250128","sys":"EP1","req":"ED1K912629","clt":"300","own":"jicorred@co.ibm.com","ans":"SUCCESS to import order.","rc":"0","tl":"OK (Return Code = 0)","cus":"GRUPO_ARGOS"},{"datetime":"2017-04-03 15:04:51","rn":"1491249126","sys":"EQ1","req":"ED1K912629","clt":"210","own":"jicorred@co.ibm.com","ans":"SUCCESS to import order.","rc":"0","tl":"OK (Return Code = 0)","cus":"GRUPO_ARGOS"}]
}



  constructor(private _app: App, public navCtrl: NavController, http: Http, public alertCtrl: AlertController, public toastCtrl: ToastController, public popoverCtrl: PopoverController, private formBuilder: FormBuilder) {

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
        this.queryCustomer = token.name;
        this.selected = token.sids; 

        this.color = 'rgb('+ token.r +','+token.g+','+token.b+')';
        this.r = token.r;
        this.g = token.g;
        this.b = token.b;

      }
    }).catch(error => {
      console.log(error);
    });

      this.form = this.formBuilder.group({
    message:['', Validators.compose([Validators.required])]
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
    {data:[10,10,10,10,10,10,10,10,10,10], label: ""}
  ];

  public lineChartColors:Array<any> = [
    { 
      backgroundColor: 'rgba('+this.r+','+this.g+','+this.b+',0.2)',
      borderColor: 'rgba('+this.r+','+this.g+','+this.b+',1)',
      pointBackgroundColor: 'rgba('+this.r+','+this.g+','+this.b+',1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba('+this.r+','+this.g+','+this.b+',0.8)'
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

  public chartLabels:string[] = ["", "", ""];
  public chartType:string = "horizontalBar";
  public chartLegend:boolean = false;
  public chartData:any[] = [
    {data:[10,10,10], label: "Total duration (ms)"}
  ];

    public barChartColors:Array<any> = [
    { 
      backgroundColor: 'rgba('+this.client.r+','+this.client.g+','+this.client.b+',0.6)',
      borderColor:'rgba('+this.client.r+','+this.client.g+','+this.client.b+',1)'
    }
  ];

    // donChart
  public donChartData:number[] = [1,1,1,1,1];
  public donChartLabels:string[] = ["","","","",""];
  public donChartOptions:any = {
    responsive: true,
          tooltips : {
                callbacks: {
                    label: function(tooltipItem, data) { 

                      return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] + "";
                    }
                }
          }
    
  };

  public donChartLegend:boolean = true;
  public donChartType:string = 'doughnut';

  // Color
    public colors:Array<any> = [
    { 
      backgroundColor: this.client.colors    }
  ];


// Send message to conversation
public sendMessage(){

    this.messages.push({text:this.form.value.message, resp: false});
    

    if(this.usingLocalConversation){

      var ott = this.form.value.message.trim();

      if (ott.length > 8){
        this.ot = ott;
        this.getOT();

                this.form.patchValue({
        message: ""
});

      }

    }else{


    var link = this.url +'message';
    var data = JSON.stringify({message: this.form.value.message});

    this.chatInput = this.form.value.message;

        this.form.patchValue({
        message: ""
});
        
        this.http.post(link, data, { headers: this.contentHeader })
        .subscribe(data => {
          
          var respp = data.json();
         console.log(respp);

        if(respp.response.output.text.length > 0){

        this.messages.push({text:respp.response.output.text[0], resp:true});
        }

        if(respp.response.intents.length > 0){
          this.loadChart(respp.response.intents[0].intent,respp.response.entities)
        }
        

        }, error => {
            console.log("Oooops!");
        });
    
  }
        
}


loadChart(intent, entities){
  switch (intent) {
    case 'timeline_cancelled_jobs':
        this.processEntities(entities);
        this.updateLine('jobchart4');
        break;
    case 'most_duration_cancelled_jobs':
        this.processEntities(entities);
        this.updateBar('jobchart');
        break;
    case 'most_cancelled_jobs':
        this.processEntities(entities);
        this.updateDon('jobchart3');
        break;
    case 'users_most_cancelled_jobs':
        this.processEntities(entities);
        this.updateDon('jobchart2');
        break;
    case 'cancelled_jobs_number':
        this.processEntities(entities);
        this.updateLine('jobchart4');
        break;
    case 'heaviest_transactions':
        this.processEntities(entities);
        this.updateDon2('transchart');
        break;
    case 'transactions_average_memory':
      this.processEntities(entities);
      this.updateBar2('memorychart');
      break;
    case 'transactions_private_average_memory':
      this.processEntities(entities);
      this.updateBar2('memorychart2');
      break;
    case 'timeline_dumps':
      this.processEntities(entities);
      this.updateLine2('dumpchart3');
      break;
    case 'most_dumps_programs':
      this.processEntities(entities);
      this.updateBar3('dumpchart');
      break;
    case 'errors_dumps':
      this.processEntities(entities);
      this.updateBar3('dumpchart2');
      break;
    case 'dynamicot_ot':
        if(this.checkOT()){
          this.getOT();
        }else{
          this.usingLocalConversation = true;
          this.messages.push({text:"Please provide the Transport Order Number", resp:true});
        }
        break;

} 
}

processEntities(entities){

  this.loading = true;

  var date1;
  var date2;
  var custt;
  var sidd = [];
  var elem;

  for (var i = 0; i < entities.length; i ++){
    elem = entities[i];
    if(elem.entity === 'customer'){
      custt = elem.value;
    }else if(elem.entity === 'sid'){
      sidd.push(elem.value);
    }else if(elem.entity === 'sys-date'){
      if(!date1){
        date1 = moment(elem.value).format("YYYY-MM-DDTHH:mm");
      }else if(!date2){
        date2 = moment(elem.value).format("YYYY-MM-DDTHH:mm");
      }
    }
  }

  if(date1){
    this.start = date1;
  }
  if(date2){
    this.end = date2
  }
  /*if(custt){
    this.queryCustomer = custt;
  }*/
  /*if(sidd.length > 0){
    this.selected = sidd;
  }*/

    this.start = moment(this.start).utc().startOf('day').format();
    this.end = moment(this.end).utc().endOf('day').format();


}

    hideCharts(){
    this.showBigNumber= false;

    this.showLineChart = false;

    this.showBarChart = false;

    this.showDoughnutChart = false;
  }

  checkOT():boolean {

    var sp = this.chatInput.split("TO");

    if(sp.length > 1){

      var sp2 = sp[sp.length-1].trim();

      if(sp2.length > 0){
        this.ot = sp2;
        return true;
      }

    }else{
      return false;
    }


  }
  
  getOT():void {

    this.loading = true;

    //TODO
    var link = "https://dynamic-ot-node.mybluemix.net/test/?OT=" + this.ot;
    //var data = JSON.stringify({ot:this.ot});
        
       this.http.get(link, { headers: this.contentHeader })
        .subscribe(data => {
         console.log(data.json());

        var otts = data.json().items;

         this.loading = false;

         this.usingLocalConversation = false;

         if(otts && otts.length > 0){

           this.messages.push({text:'Here are the TOs you asked for', resp:true});   

          for(var i = 0; i < otts.length; i++){
            var item = otts[i];
           this.messages.push({text:item.CUSTOMER + ', ' + item.SID + ', ' + item.CL + ', ' + item.RC + ', ' + item.OT + ', ' + item.LAST_MOD  + ', ' + item.RS_TXT, resp:true});               
          };

         
        }else{
          this.messages.push({text:"There is no information about that TO", resp:true});   
        }

        }, error => {
            this.messages.push({text:"There is no information about that TO", resp:true});  
            this.loading = false;
            this.usingLocalConversation = false;
        });
        

  }


    updateBar(urll):void {
    
    var link = this.url + urll;
    var data = JSON.stringify({start: this.start, end:this.end, client:this.queryCustomer, sids:this.selected});
        
        this.http.post(link, data, { headers: this.contentHeader })
        .subscribe(data => {
         console.log(data.json());

         this.data = data.json().jobs;

         this.loading = false;

         this.hideCharts();
         this.showBarChart = true;

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

        }, error => {
            console.log("Oooops!");
        });
        

  }

      updateBar2(urll):void {
    
    var link = this.url + urll;
    var data = JSON.stringify({start: this.start, end:this.end, client:this.queryCustomer, sids:this.selected});
        
        this.http.post(link, data, { headers: this.contentHeader })
        .subscribe(data => {
         console.log(data.json());

         this.data = data.json().trans;

         this.loading = false;

         this.hideCharts();
         this.showBarChart = true;

         if(this.data.length > 0){

          var ar1 = [];
          var ar2 = [];

          this.data.forEach(function(job){
              ar1.push(job.value);
              ar2.push(job._id);
          });

          
          this.chartLabels = ar2;
          setTimeout(()=>{this.chartData = [{data:ar1, label: "Average Memory Usage (KB)"}];}, 1000);
         
        }else{
            this.chartLabels = ["Tran1", "Tran2", "Tran3", "Tran4","Tran5","Tran6","Tran7","Tran8","Tran9","Tran10"];
            setTimeout(()=>{this.chartData = [{data:[10,10,10], label: "Average Memory Usage (KB)"}];}, 1000);
        }

        }, error => {
            console.log("Oooops!");
        });
        

  }

  updateBar3(urll):void {
    
    var link = this.url + urll;
    var data = JSON.stringify({start: this.start, end:this.end, client:this.queryCustomer, sids:this.selected});
        
        this.http.post(link, data, { headers: this.contentHeader })
        .subscribe(data => {
         console.log(data.json());

         this.data = data.json().dumps;

         this.loading = false;

         this.hideCharts();
         this.showBarChart = true;

         if(this.data.length > 0){

          var ar1 = [];
          var ar2 = [];

          this.data.forEach(function(job){
              ar1.push(job.value);
              ar2.push(job._id);
          });

          
          this.chartLabels = ar2;
          setTimeout(()=>{this.chartData = [{data:ar1, label: "Number of Dumps"}];}, 1000);
         
        }else{
            this.chartLabels = ["Program1", "Program2", "Program3", "Program4","Program5"];
            setTimeout(()=>{this.chartData = [{data:[10,10,10,10,10], label: "Number of Dumps"}];}, 1000);        }

        }, error => {
            console.log("Oooops!");
        });
        

  }


    updateDon(urll):void {
    
    var link = this.url+ urll;
    var data = JSON.stringify({start: this.start, end:this.end, client:this.queryCustomer, sids:this.selected});
        
        this.http.post(link, data, { headers: this.contentHeader })
        .subscribe(data => {
         console.log(data.json());

         var jobx = data.json().jobs;

         this.loading = false;

          this.hideCharts();
         this.showDoughnutChart = true;

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

  updateDon2(urll):void {
    
    var link = this.url+ urll;
    var data = JSON.stringify({start: this.start, end:this.end, client:this.queryCustomer, sids:this.selected});
        
        this.http.post(link, data, { headers: this.contentHeader })
        .subscribe(data => {
         console.log(data.json());

         var jobx = data.json().trans;

         this.loading = false;

          this.hideCharts();
         this.showDoughnutChart = true;

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

      updateLine(urll):void {
    
    var link = this.url+ urll;
    var data = JSON.stringify({start: this.start, end:this.end, client:this.queryCustomer, sids:this.selected});
        console.log(data);
        this.http.post(link, data, { headers: this.contentHeader })
        .subscribe(data => {
         console.log(data.json());

         var jobx = data.json().jobs;

         this.loading = false;

        this.hideCharts();
         this.showLineChart = true;
         this.showBigNumber = true;

         if(jobx.length > 0){

         var ar1 = [];
         var ar2 = [];
         var tot = 0;

         jobx.forEach(function(job){
            ar1.push(job.value);
            ar2.push(moment(job._id).add(1,"day").format("D/M/YYYY"));
            tot += job.value;
         });

         this.bigNumber = tot;

         
         this.lineChartLabels = ar2;
         setTimeout(()=>{this.lineChartData = [{data: ar1, label: "Cancelled jobs"}]
         
      }, 1000);

         }else{
          this.lineChartLabels = ["Date1", "Date2", "Date3","Date4","Date5","Date6","Date7","Date8","Date9","Date10"];
         setTimeout(()=>{this.lineChartData = [
    {data:[10,10,10,10,10,10,10,10,10,10], label: "Cancelled jobs"}
         ]}, 1000);

         this.bigNumber = 0;
        }
        }, error => {
            console.log("Oooops!");
        });
        
      }

      updateLine2(urll):void {
    
    var link = this.url+ urll;
    var data = JSON.stringify({start: this.start, end:this.end, client:this.queryCustomer, sids:this.selected});
        console.log(data);
        this.http.post(link, data, { headers: this.contentHeader })
        .subscribe(data => {
         console.log(data.json());

         var jobx = data.json().dumps;

         this.loading = false;

        this.hideCharts();
         this.showLineChart = true;
         this.showBigNumber = true;

         if(jobx.length > 0){

         var ar1 = [];
         var ar2 = [];
         var tot = 0;

         jobx.forEach(function(job){
            ar1.push(job.value);
            ar2.push(moment(job._id).add(1,"day").format("D/M/YYYY"));
            tot += job.value;
         });

         this.bigNumber = tot;

         
         this.lineChartLabels = ar2;
         setTimeout(()=>{this.lineChartData = [{data: ar1, label: "Number of dumps"}]
         
      }, 1000);

         }else{
          this.lineChartLabels = ["Date1", "Date2", "Date3","Date4","Date5","Date6","Date7","Date8","Date9","Date10"];
         setTimeout(()=>{this.lineChartData = [
    {data:[10,10,10,10,10,10,10,10,10,10], label: "Number of dumps"}
         ]}, 1000);

         this.bigNumber = 0;
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
