import { Component } from '@angular/core';
import {ViewController, App } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { BasePage } from '../base/base';
import { PasswordPage } from '../password/password';

@Component({
  selector: 'page-popover',
  template: '    <ion-list>'+
      '<button ion-item (click)="goBase()" *ngIf="cust">Customers</button>'+
      '<button ion-item (click)="goPass()">Change password</button>'+
      '<button ion-item (click)="logout()">Log out</button>'+
    '</ion-list>'
})
export class PopoverPage {

  local: Storage = new Storage();

  cust:boolean = false;

  constructor(public viewCtrl: ViewController, private _app: App) {

        this.local.get('user').then(token => {
      if(token){
        if(token.ibm){
          this.cust = true;
        }
      }else{
      }
    }).catch(error => {
      console.log(error);
    });

  }

    // Go to login screen
  goLogin(){
    this._app.getRootNav().popToRoot();
    this.viewCtrl.dismiss();
                 }

    // Go to base screen
  goBase(){
    this._app.getRootNav().popTo(BasePage);
    this.viewCtrl.dismiss();
                 }

    // Go to change password screen
  goPass(){
    this._app.getRootNav().push(PasswordPage);
    this.viewCtrl.dismiss();
                 }

// Logout
 logout(){
   this.local.set('user', null);
   this.goLogin();
                }

}
