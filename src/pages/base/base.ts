import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';

import { Storage } from '@ionic/storage';

/*
  Generated class for the Base page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-base',
  templateUrl: 'base.html'
})
export class BasePage {

  contentHeader: Headers = new Headers({"Content-Type": "application/json"});

  local: Storage = new Storage();

  public url:String = "https://watson-advisor.mybluemix.net/";

  user: any = {};

  constructor(public navCtrl: NavController, public navParams: NavParams, public http:Http) {

      this.local.get('user').then(token => {

    if(token){
      this.user = token;
    }
  }).catch(error => {
    console.log(error);
  });

}
/*
getClients(){

      var url = this.url+'clients';
    
    var body = {username: this.user.username};
    this.http.post(url,body, { headers: this.contentHeader }).map(res => res.json()).subscribe(
          resp => {
            console.log(resp);
            if(resp.success){
              this.clients = resp.clients;
          }
          },
          error => console.error('Error: ' + error),
          () => console.log('Completed!')
        );


}*/

goDashboard(client){

  this.local.set("client",client);
  this.navCtrl.push(TabsPage);

}

 logout(){
   this.local.set('user', null);
   this.navCtrl.popToRoot();
 }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BasePage');
  }

}
