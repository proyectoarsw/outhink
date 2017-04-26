import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import {Validators, FormBuilder } from '@angular/forms';
import {Http, Headers} from '@angular/http';
import { Storage } from '@ionic/storage';

/*
  Generated class for the Password page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-password',
  templateUrl: 'password.html'
})
export class PasswordPage {

   contentHeader: Headers = new Headers({"Content-Type": "application/json"});

  local: Storage = new Storage();
  tabBarElement: any;

  public form: any;

  id: String;

  user:any ={};

  public url:String = "https://watson-advisor.mybluemix.net/";

  constructor(public navCtrl: NavController, public navParams: NavParams, public http:Http, private formBuilder: FormBuilder, public toastCtrl: ToastController) {

      this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
      this.local.get('user').then(token => {

    if(token){
      this.id = token._id;
      this.user = token;
    }
  }).catch(error => {
    console.log(error);
  });


  this.form = this.formBuilder.group({
    pass1:['', Validators.compose([Validators.required, Validators.minLength(8)])],
    pass2:['',Validators.compose([Validators.required, Validators.minLength(8)])]
  });

}

    change(){

    var url = this.url+'users/password';
    
    if(this.form.value.pass1 === this.form.value.pass2){
    var body = {id: this.id, password: this.form.value.pass1};
    this.http.put(url,body, { headers: this.contentHeader }).map(res => res.json()).subscribe(
          resp => {
            console.log(resp);
            if(resp.success){

            this.presentToast("Password successfuly changed");
            this.navCtrl.pop();
          }
          },
          error => console.error('Error: ' + error),
          () => console.log('Completed!')
        );

    }else{
      this.presentToast("Passwords doesn't match");
    }
  
  }

  presentToast(message){

    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();

  }

    ionViewWillEnter() {
  this.tabBarElement.style.display = 'none';
}

ionViewWillLeave() {
  this.tabBarElement.style.display = 'flex';
}

}
