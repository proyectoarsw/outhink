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
    
    var link = this.url+'workloadchart';
    var data = JSON.stringify({start: this.start, end:this.end, client:this.client.name, sids:this.selected});
        
        this.http.post(link, data, { headers: this.contentHeader })
        .subscribe(data => {
         console.log(data.json());

         this.loading = false;

         var items = data.json().items;

         if(items.length > 0){



         }else{

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
