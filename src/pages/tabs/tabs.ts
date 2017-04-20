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

  user: any = {};
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = HomePage;
  tab2Root: any = AboutPage;
  tab3Root: any = ContactPage;
  //tab4Root: any = AvailabilityPage;
  tab5Root: any = ChatPage;
  tab6Root: any = WorkloadPage;

  showExperience = false;
  showTransactions = false;
  showWorkload = false;
  showJobs = true;
  showDumps = true;

  constructor() {



    this.local.get('user').then(token => {
      if (token) {
        this.user = token;



        if (token.username == 'mehernan@co.ibm.com' || token.username == 'jarincon@co.ibm.com' || token.username == 'demo@co.ibm.com' || token.username == 'rvargass@co.ibm.com') {
          this.showExperience = true;
          //this.showWorkload = true;
        }else{
          this.showExperience = false;
        }

        //this.showDumps = true;
        //this.showJobs = true;
        /*
                if(token.username == 'mehernan@co.ibm.com'){
                  this.showWorkload = true;
                }
                */

        this.local.get('client').then(token => {
          if (token) {
            if (token.name == 'Nutresa' || token.name == 'Sura') {
              this.showTransactions = true;
            }
          }
        }).catch(error => {
          console.log(error);
        });

      }
    }).catch(error => {
      console.log(error);
    });



  }
}
