import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';

import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';
import {Validators, FormBuilder } from '@angular/forms';
import { BasePage } from '../base/base';
import { TabsPage } from '../tabs/tabs';

import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {


  contentHeader: Headers = new Headers({"Content-Type": "application/json"});

  local: Storage = new Storage();
  tabBarElement: any;

  public form: any;

  public url:String = "https://watson-advisor.mybluemix.net/";

  constructor(public navCtrl: NavController, public navParams: NavParams, public http:Http, public toastCtrl: ToastController, private formBuilder: FormBuilder) {

  this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
  this.local.get('user').then(token => {

    if(token){
      this.updateUser(token);
    }
  }).catch(error => {
    console.log(error);
  });


  this.form = this.formBuilder.group({
    username:['', Validators.compose([Validators.required])],
    password:['',Validators.compose([Validators.required, Validators.minLength(8)])]
  });


  }

    login(){

    var url = this.url+'login';
    
    var body = {username: this.form.value.username, password: this.form.value.password};
    this.http.post(url,body, { headers: this.contentHeader }).map(res => res.json()).subscribe(
          resp => {
            console.log(resp);
            if(resp.success){

            
            this.local.set("user",resp.user);
            if(resp.user.ibm){
              this.navCtrl.push(BasePage);
            }else{
              this.local.set("client",resp.user.clients[0]);
              this.navCtrl.push(TabsPage);
            }
          }else{
            this.presentToast(resp.message);
          }
          },
          error => console.error('Error: ' + error),
          () => console.log('Completed!')
        );

  
  }

      updateUser(us){

    var url = this.url+'uservalidate';
    
    var body = {username: us.username};
    this.http.post(url,body, { headers: this.contentHeader }).map(res => res.json()).subscribe(
          resp => {
            console.log(resp);
            if(resp.success){

            
              this.local.set("user",resp.user);
            if(resp.user.ibm){
              this.navCtrl.push(BasePage);
            }else{
              this.local.set("client",resp.user.clients[0]);
              this.navCtrl.push(TabsPage);
            }
          }else{
            this.presentToast(resp.message);
          }
          },
          error => console.error('Error: ' + error),
          () => console.log('Completed!')
        );

  
  }

  presentToast(message){

    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();

  }

  ionViewWillEnter() {
  //this.tabBarElement.style.display = 'none';
}

ionViewWillLeave() {
  //this.tabBarElement.style.display = 'flex';
}

}
