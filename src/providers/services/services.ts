import { Injectable } from '@angular/core';

import { NativeStorage } from '@ionic-native/native-storage';
import { Storage } from '@ionic/storage';

@Injectable()
export class ServicesProvider {

  user;
  customer;

  constructor(public storage: Storage) {
    this.user = {};
    this.customer = {};

    storage.ready().then(() => {
});
  }

  getUser(){
    return this.user;
  }

  setUser(us){
    this.user = us;
  }

  getCustomer(){
    return this.customer;
  }

  setCustomer(cus){
    this.customer = cus;
  }

  logout(){
    this.storage.remove('user').then(() => { })
  }
/*
  userLoggedIn(){

    this.storage.get('user').then((us) => {
      console.log("I got the user : " + us.name);
  return us;
});
  }
*/
  saveUser(us){
    this.storage.set('user', us);
  }
}
