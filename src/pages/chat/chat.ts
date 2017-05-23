import { Component, ViewChild } from '@angular/core';
import { NavController, AlertController, ToastController, App, PopoverController, Content } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import * as moment from "moment";
import { Validators, FormBuilder } from '@angular/forms';
import { PopoverPage } from '../popover/popover';

import { ServicesProvider } from '../../providers/services/services';

@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
  queries: {
    content: new ViewChild('content')
  }
})
export class ChatPage {

  @ViewChild(Content) content: Content;

  http: Http;
  start: String = moment().subtract(1, "days").format("YYYY-MM-DDTHH:mm");
  end: String = moment().subtract(1, "days").format("YYYY-MM-DDTHH:mm");
  contentHeader: Headers = new Headers({ "Content-Type": "application/json" });
  data: Array<any> = [];

  public form: any;

  color: String = 'rgb(255,255,255)';

  r: Number = 255;
  g: Number = 255;
  b: Number = 255;

  public url: String = "https://watson-advisor.mybluemix.net/";

  loading: boolean = false;

  user: any = {};
  client: any = {};

  selected = [];

  messages: any[] = [{ text: "Hello I'm Watson, what do you need ?", resp: true }];

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

  ots = {
    "DEVK9A06MY": [{ "datetime": "2017-04-03 12:12:47", "rn": "1491239054", "sys": "PRD", "req": "DEVK9A06MY", "clt": "400", "own": "jicorred@co.ibm.com", "ans": "SUCCESS to import order.", "rc": "0", "tl": "OK (Return Code = 0)", "cus": "CAFAM" }],
    "ED1K912629": [{ "datetime": "2017-04-03 15:21:33", "rn": "1491250128", "sys": "EP1", "req": "ED1K912629", "clt": "300", "own": "jicorred@co.ibm.com", "ans": "SUCCESS to import order.", "rc": "0", "tl": "OK (Return Code = 0)", "cus": "GRUPO_ARGOS" }, { "datetime": "2017-04-03 15:04:51", "rn": "1491249126", "sys": "EQ1", "req": "ED1K912629", "clt": "210", "own": "jicorred@co.ibm.com", "ans": "SUCCESS to import order.", "rc": "0", "tl": "OK (Return Code = 0)", "cus": "GRUPO_ARGOS" }]
  }



  constructor(public services: ServicesProvider, private _app: App, public navCtrl: NavController, http: Http, public alertCtrl: AlertController, public toastCtrl: ToastController, public popoverCtrl: PopoverController, private formBuilder: FormBuilder) {

    this.http = http;



    this.user = this.services.getUser();

    this.client = this.services.getCustomer();

    this.queryCustomer = this.client.name;
    this.selected = this.client.sids;

    this.color = 'rgb(' + this.client.r + ',' + this.client.g + ',' + this.client.b + ')';
    this.r = this.client.r;
    this.g = this.client.g;
    this.b = this.client.b;

    this.form = this.formBuilder.group({
      message: ['', Validators.compose([Validators.required])]
    });

  }

  //LineChart
  public lineChartOptions: any = {
    responsive: true,
    tooltips: {
      displayColors: false,
      callbacks: {
        label: function (tooltipItem, data) {
          return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].toLocaleString('de-DE', { maximumFractionDigits: 1 });
        }
      }
    }
  };

  public lineChartLabels: string[] = ["Date1", "Date2", "Date3", "Date4", "Date5", "Date6", "Date7", "Date8", "Date9", "Date10"];
  public lineChartType: string = "line";
  public lineChartLegend: boolean = false;
  public lineChartData: any[] = [
    { data: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10], label: "" }
  ];

  public lineChartColors: Array<any> = [
    {
      backgroundColor: 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',0.2)',
      borderColor: 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',1)',
      pointBackgroundColor: 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',0.8)'
    }
  ];

  //BarChart
  public chartOptions: any = {
    responsive: true,

    tooltips: {
      displayColors: false,
      titleFontSize: 0,
      callbacks: {
        label: function (tooltipItems, data) {
          return tooltipItems.xLabel.toLocaleString('de-DE', { maximumFractionDigits: 1 }) + '';
        }
      }
    },
    scales: {
      xAxes: [{
        ticks: {
          beginAtZero: true,
          callback: function (label, index, labels) {
            return label + '';
          }
        },
        scaleLabel: {
          display: false,
          labelString: ''
        }
      }],
      yAxes: [{
        stacked: true
      }]
    }
  };

  public chartLabels: string[] = ["", "", ""];
  public chartType: string = "horizontalBar";
  public chartLegend: boolean = false;
  public chartData: any[] = [
    { data: [10, 10, 10], label: "Total duration (ms)" }
  ];

  public barChartColors: Array<any> = [
    {
      backgroundColor: 'rgba(' + this.client.r + ',' + this.client.g + ',' + this.client.b + ',0.6)',
      borderColor: 'rgba(' + this.client.r + ',' + this.client.g + ',' + this.client.b + ',1)'
    }
  ];

  // donChart
  public donChartData: number[] = [1, 1, 1, 1, 1];
  public donChartLabels: string[] = ["", "", "", "", ""];
  public donChartOptions: any = {
    responsive: true,
    tooltips: {
      callbacks: {
        label: function (tooltipItem, data) {

          return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].toLocaleString('de-DE', { maximumFractionDigits: 1 }) + '';
        }
      }
    }

  };

  public donChartLegend: boolean = true;
  public donChartType: string = 'doughnut';

  // Color
  public colors: Array<any> = [
    {
      backgroundColor: this.client.colors
    }
  ];


  // Send message to conversation
  public sendMessage() {

    this.addMessage(this.form.value.message, false);


    if (this.usingLocalConversation) {

      var ott = this.form.value.message.trim();

      if (ott.length > 8) {
        this.ot = ott;
        this.getOT();

        this.form.patchValue({
          message: ""
        });

      }

    } else {


      var link = this.url + 'message';
      var data = JSON.stringify({ message: this.form.value.message });

      this.chatInput = this.form.value.message;

      this.form.patchValue({
        message: ""
      });

      this.http.post(link, data, { headers: this.contentHeader })
        .subscribe(data => {

          var respp = data.json();
          console.log(respp);

          if (respp.response.output.text.length > 0) {

            this.addMessage(respp.response.output.text[0], true);

          }

          if (respp.response.intents.length > 0) {
            this.loadChart(respp.response.intents[0].intent, respp.response.entities)
          }


        }, error => {
          console.log("Oooops!");
        });

    }

  }


  loadChart(intent, entities) {
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
        this.updateDon('transchart');
        break;
      case 'transactions_average_memory':
        this.processEntities(entities);
        this.updateBar('memorychart');
        break;
      case 'transactions_private_average_memory':
        this.processEntities(entities);
        this.updateBar('memorychart2');
        break;
      case 'timeline_dumps':
        this.processEntities(entities);
        this.updateLine('dumpchart3');
        break;
      case 'most_dumps_programs':
        this.processEntities(entities);
        this.updateBar('dumpchart');
        break;
      case 'errors_dumps':
        this.processEntities(entities);
        this.updateBar('dumpchart2');
        break;
      case 'alerts_barchart':
        this.processEntities(entities);
        this.updateBar4('https://myhive.mybluemix.net/postdb2month');
        break;
      case 'total_alerts_piechart':
        this.processEntities(entities);
        this.updateDon3('https://myhive.mybluemix.net/filterc');
        break;

      case 'total_alerts_linechart':
        this.processEntities(entities);
        this.updateLine3('https://myhive.mybluemix.net/postdb2weekone');
        break;


      case 'dynamicot_ot':
        if (this.checkOT()) {
          this.getOT();
        } else {
          this.usingLocalConversation = true;
          this.addMessage('Please provide the Transport Order Number', true);
        }
        break;

    }
  }

  processEntities(entities) {

    this.loading = true;

    var date1;
    var date2;
    var custt;
    var sidd = [];
    var elem;

    for (var i = 0; i < entities.length; i++) {
      elem = entities[i];
      if (elem.entity === 'customer') {
        custt = elem.value;
      } else if (elem.entity === 'sid') {
        sidd.push(elem.value);
      } else if (elem.entity === 'sys-date') {
        if (!date1) {
          date1 = moment(elem.value).format("YYYY-MM-DDTHH:mm");
        } else if (!date2) {
          date2 = moment(elem.value).format("YYYY-MM-DDTHH:mm");
        }
      }
    }

    if (date1) {
      this.start = date1;
    }
    if (date2) {
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

  checkOT(): boolean {

    var sp = this.chatInput.split("TO");

    if (sp.length > 1) {

      var sp2 = sp[sp.length - 1].trim();

      if (sp2.length > 0) {
        this.ot = sp2;
        return true;
      }

    } else {
      return false;
    }


  }

  getOT(): void {

    this.loading = true;

    var link = "https://dynamic-ot-node.mybluemix.net/test/?OT=" + this.ot;
    //var data = JSON.stringify({ot:this.ot});

    this.http.get(link, { headers: this.contentHeader })
      .subscribe(data => {
        console.log(data.json());

        var otts = data.json().items;

        this.loading = false;

        this.usingLocalConversation = false;

        if (otts && otts.length > 0) {

          this.addMessage('Here are the TOs you asked for', true);

          for (var i = 0; i < otts.length; i++) {
            var item = otts[i];
            this.addMessage(item.CUSTOMER + ', ' + item.SID + ', ' + item.CL + ', ' + item.RC + ', ' + item.OT + ', ' + item.LAST_MOD + ', ' + item.RS_TXT, true);
          };


        } else {
          this.addMessage("Sorry there is no information", true);
        }

      }, error => {
        this.addMessage("Sorry there is no information", true);
        this.loading = false;
        this.usingLocalConversation = false;
      });


  }


  updateBar(urll): void {

    var link = this.url + urll;
    var data = JSON.stringify({ start: this.start, end: this.end, client: this.queryCustomer, sids: this.selected });

    this.http.post(link, data, { headers: this.contentHeader })
      .subscribe(data => {

        this.data = data.json().data;

        this.loading = false;

        if (this.data.length > 0) {

          var ar1 = [];
          var ar2 = [];

          this.data.forEach(function (job) {
            ar1.push(job.duration);
            ar2.push(job.job_name);
          });

          var mess = this.messages[this.messages.length - 1];

          mess.chart = "bar";
          mess.data = { labels: ar2, data: [{ data: ar1, label: "" }] };

          this.scrollToBottom();


        } else {

          this.addMessage("Sorry there is no information", true);

        }

      }, error => {
        console.log("Oooops!");
      });


  }


  updateBar4(urll): void {
    var date1 = moment(this.start).format()
    var date2 = moment(this.end).format()
    var link = urll + "/" + this.queryCustomer.toUpperCase() + "/" + date1 + "/" + date2;
    //var data = JSON.stringify({ start: this.start, end: this.end, client: this.queryCustomer, sids: this.selected });
    console.log(link);
    this.http.get(link)
      .subscribe(data => {
        var month = data.json().months;

        console.log(data, month);
        this.data = data.json().months;
        if (this.data.length > 0) {

          var ar1 = [];
          var ar2 = [];

          this.data.forEach(function (month) {
            ar1.push(month.value);
            ar2.push(month._id.month);
          });

          var mess = this.messages[this.messages.length - 1];

          mess.chart = "bar";
          mess.data = { labels: ar2, data: [{ data: ar1, label: "Number of alerts" }] };

          this.scrollToBottom();

        } else {

          this.addMessage("Sorry there is no information", true);
        }


      }, error => {
        console.log("Oooops!");
        console.log(error);
      });


  }


  updateDon(urll): void {

    var link = this.url + urll;
    var data = JSON.stringify({ start: this.start, end: this.end, client: this.queryCustomer, sids: this.selected });

    this.http.post(link, data, { headers: this.contentHeader })
      .subscribe(data => {

        var datax = data.json().data;

        this.loading = false;

        if (datax.length > 0) {

          var ar1 = [];
          var ar2 = [];

          datax.forEach(function (item) {
            ar1.push(item.value);
            ar2.push(item._id);
          });

          var mess = this.messages[this.messages.length - 1];

          mess.chart = "don";
          mess.data = { labels: ar2, data: ar1 };

          this.scrollToBottom();


        } else {

          this.addMessage("Sorry there is no information", true);

        }
      }, error => {
        console.log("Oooops!");
      });




  }

  updateDon3(urll): void {
    var date1 = moment(this.start).format()
    var date2 = moment(this.end).format()
    var d1 = moment(date1).format("MM-DD-YYYY")
    var d2 = moment(date2).format("MM-DD-YYYY")

    //var a ='All';
    var link = urll + "/" + this.queryCustomer.toUpperCase() + "/" + date1 + "/" + date2;
    //var data = JSON.stringify({ start: this.start, end: this.end, client: this.queryCustomer, sids: this.selected });
    console.log(link);
    this.http.get(link)
      .subscribe(data => {
        console.log(data.json());

        var custo = data.json().cus;

        this.loading = false;

        if (custo.length > 0) {

          var ar1 = [];
          var ar2 = [];

          var job;

          for (var i = 0; i < custo.length && i < 26; i++) {
            job = custo[i];
            ar1.push(job.value);
            ar2.push(d1 + " - " + d2);
            var tot = 0;
            tot += job.value;
          }

          var mess = this.messages[this.messages.length - 1];

          mess.chart = "line";
          mess.data = { labels: ar2, data: [{ data: ar1, label: "Number of dumps" }], data2: tot };

          this.scrollToBottom();


        } else {

          this.addMessage("Sorry there is no information", true);

        }

      }, error => {
        console.log("Oooops!");
      });




  }

  updateLine(urll): void {

    var link = this.url + urll;
    var data = JSON.stringify({ start: this.start, end: this.end, client: this.queryCustomer, sids: this.selected });
    console.log(data);
    this.http.post(link, data, { headers: this.contentHeader })
      .subscribe(data => {

        var datax = data.json().data;

        this.loading = false;

        if (datax.length > 0) {

          var ar1 = [];
          var ar2 = [];
          var tot = 0;

          datax.forEach(function (item) {
            ar1.push(item.value);
            ar2.push(moment(item._id).add(1, "day").format("D/M/YYYY"));
            tot += item.value;
          });

          var mess = this.messages[this.messages.length - 1];

          mess.chart = "line";
          mess.data = { labels: ar2, data: [{ data: ar1, label: "" }], data2: tot.toLocaleString('de-DE') };

          this.scrollToBottom();


        } else {

          this.addMessage("Sorry there is no information", true);
        }
      }, error => {
        console.log("Oooops!");
      });

  }

  updateLine3(urll): void {

    var date1 = moment(this.start).format()
    var date2 = moment(this.end).format()

    var link = urll + "/" + this.queryCustomer.toUpperCase() + "/" + date1 + "/" + date2;
    //var data = JSON.stringify({ start: this.start, end: this.end, client: this.queryCustomer, sids: this.selected });
    this.http.get(link)
      .subscribe(data => {
        console.log(data.json(), link);
        var week = data.json().weeks;

        this.loading = false;

        if (week.length > 0) {

          var ar1 = [];
          var ar2 = [];
          var tot = 0;

          week.forEach(function (job) {
            ar1.push(job.value);
            ar2.push(job._id.week);
            tot += job.value;
          });

          var mess = this.messages[this.messages.length - 1];

          mess.chart = "line";
          mess.data = { labels: ar2, data: [{ data: ar1, label: "Number of alerts" }], data2: tot.toLocaleString('de-DE') };

          this.scrollToBottom();

        } else {

          this.addMessage("Sorry there is no information", true);

        }




      }, error => {
        console.log("Oooops!");
      });

  }

  addMessage(text, isResponse) {

    this.messages.push({ text: text, resp: isResponse });

    this.scrollToBottom();

  }

  scrollToBottom() {

    setTimeout(() => { this.content.scrollToBottom(); }, 500);

  }

  // display menu
  displayMenu(event) {

    let popover = this.popoverCtrl.create(PopoverPage);
    popover.present({
      ev: event
    });
  }


}
