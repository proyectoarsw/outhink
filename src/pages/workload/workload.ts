import { Component } from '@angular/core';
import { NavController, AlertController, ToastController, App, PopoverController } from 'ionic-angular';
import {Http, Headers} from '@angular/http';
import { LoadingController } from 'ionic-angular';
import 'rxjs/add/operator/map';
import * as moment from "moment";

import { PopoverPage } from '../popover/popover';

import { Storage } from '@ionic/storage';

/*
  Generated class for the Workload page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-workload',
  templateUrl: 'workload.html'
})
export class WorkloadPage {

http: Http;
start: String = moment().subtract(1,"days").format("YYYY-MM-DDTHH:mm");
end: String = moment().subtract(1,"days").format("YYYY-MM-DDTHH:mm");
contentHeader: Headers = new Headers({"Content-Type": "application/json"});
data : Array<any> = [];

color : String = 'rgb(255,255,255)';

r: Number = 255;
g:Number = 255;
b: Number = 255;

public url:String = "https://watson-advisor.mybluemix.net/";

local: Storage = new Storage();

loading: boolean = false;

user:any = {};
client:any = {};

selectedCheck =[];
selected = [];

  constructor(private _app: App, public navCtrl: NavController, http: Http, public alertCtrl: AlertController, public toastCtrl: ToastController, public popoverCtrl: PopoverController,public loadingCtrl: LoadingController) {
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

        for(let elem of this.client.sids){
          this.selectedCheck.push({selected:true,sid:elem});
        };

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

  updateChart():void {

    this.loading = true;

    // Check if there is something selected
    this.selected = [];
    var coun = 0;

    this.selectedCheck.forEach(function(elem){
      if(elem.selected){coun ++}
    });

// Add sids

    if(coun > 0){

          for(let elem of this.selectedCheck){
      if(elem.selected){this.selected.push(elem.sid)}
    };

    }else{
             for(let elem of this.selectedCheck){
          elem.selected = true;
          this.selected.push(elem.sid);
    };
  }
  
    this.start = moment(this.start).utc().startOf('day').format();
    this.end = moment(this.end).utc().endOf('day').format();
    
    var link = this.url+'workloadchart';
    var da = JSON.stringify({start: this.start, end:this.end, client:this.client.name, sids:this.selected});
        
        this.http.post(link, da, { headers: this.contentHeader })
        .subscribe(dat => {
         console.log(dat.json());

         this.loading = false;

         this.data = dat.json().items;

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
