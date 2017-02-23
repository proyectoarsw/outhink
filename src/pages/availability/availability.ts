import { Component } from '@angular/core';
import { NavController, AlertController, ToastController, App, PopoverController } from 'ionic-angular';
import {Http/*, Headers*/} from '@angular/http';
import { LoadingController } from 'ionic-angular';
import 'rxjs/add/operator/map';

import { PopoverPage } from '../popover/popover';

import { Storage } from '@ionic/storage';

/*
  Generated class for the Availability page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-availability',
  templateUrl: 'availability.html'
})
export class AvailabilityPage {

  http: Http;
  public url:String = "https://watson-advisor.mybluemix.net/";

local: Storage = new Storage();

user:any = {};
client:any = {};

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
      }
    }).catch(error => {
      console.log(error);
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
};
*/
        let popover = this.popoverCtrl.create(PopoverPage);
    popover.present({
      ev: event
    });
}

}
