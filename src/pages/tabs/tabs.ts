import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import { AboutPage } from '../about/about';
import { ContactPage } from '../contact/contact';
import { ChatPage } from '../chat/chat';
import { WorkloadPage } from '../workload/workload';
//import { AvailabilityPage } from '../availability/availability';

import { Storage } from '@ionic/storage';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  local: Storage = new Storage();

  user:any = {};
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = HomePage;
  tab2Root: any = AboutPage;
  tab3Root: any = ContactPage;
  //tab4Root: any = AvailabilityPage;
  tab5Root: any = ChatPage;
  tab6Root: any = WorkloadPage;

  showExperience = false;

  constructor() {

            this.local.get('user').then(token => {
      if(token){
        this.user = token;

        if(token.username == 'mehernan@co.ibm.com' || token.username == 'jarincon@co.ibm.com' || token.username == 'demo@demo.com'){
          this.showExperience = true;
        }
      }
    }).catch(error => {
      console.log(error);
    });

  }
}
