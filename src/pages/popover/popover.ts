import { Component } from '@angular/core';
import { ViewController, App } from 'ionic-angular';
import { ServicesProvider } from '../../providers/services/services';
import { BasePage } from '../base/base';
import { PasswordPage } from '../password/password';

import { Push } from '@ionic/cloud-angular';

@Component({
  selector: 'page-popover',
  template: '    <ion-list>' +
  '<button ion-item (click)="goBase()" *ngIf="cust">Customers</button>' +
  '<button ion-item (click)="goPass()">Change password</button>' +
  '<button ion-item (click)="logout()">Log out</button>' +
  '</ion-list>'
})
export class PopoverPage {

  cust: boolean = false;

  constructor(public services: ServicesProvider, public push: Push, public viewCtrl: ViewController, private _app: App) {


    if (services.getUser().ibm) {
      this.cust = true;
    }


  }

  // Go to login screen
  goLogin() {
    this._app.getRootNav().popToRoot();
    this.viewCtrl.dismiss();
  }

  // Go to base screen
  goBase() {
    this._app.getRootNav().popTo(BasePage);
    this.viewCtrl.dismiss();
  }

  // Go to change password screen
  goPass() {
    this._app.getRootNav().push(PasswordPage);
    this.viewCtrl.dismiss();
  }

  // Logout
  logout() {

    this.push.unregister();
    this.services.logout();
    this.goLogin();
  }

}
