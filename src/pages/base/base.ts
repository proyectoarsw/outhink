import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';

import { ServicesProvider } from '../../providers/services/services';

@Component({
  selector: 'page-base',
  templateUrl: 'base.html'
})
export class BasePage {

  contentHeader: Headers = new Headers({"Content-Type": "application/json"});

  public url:String = "https://watson-advisor.mybluemix.net/";

  user: any = {};

  constructor(public services: ServicesProvider, public navCtrl: NavController, public navParams: NavParams, public http:Http) {

this.user = this.services.getUser();

}

goDashboard(client){

  this.services.setCustomer(client);
  this.navCtrl.push(TabsPage);

}

 logout(){
   this.services.logout()
   this.navCtrl.popToRoot();
 }


}
