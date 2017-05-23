import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import { AboutPage } from '../about/about';
import { ContactPage } from '../contact/contact';
import { ChatPage } from '../chat/chat';
import { WorkloadPage } from '../workload/workload';
//import { AvailabilityPage } from '../availability/availability';

import { ServicesProvider } from '../../providers/services/services';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  user: any = {};

  tab1Root: any = HomePage;
  tab2Root: any = AboutPage;
  tab3Root: any = ContactPage;
  //tab4Root: any = AvailabilityPage;
  tab5Root: any = ChatPage;
  tab6Root: any = WorkloadPage;

  showExperience = true;
  showTransactions = false;
  showWorkload = false;
  showJobs = true;
  showDumps = true;

  constructor(public services: ServicesProvider) {



    this.user = this.services.getUser();

    var clien = this.services.getCustomer();

    if (clien.name == 'Nutresa' || clien.name == 'Sura') {
      this.showTransactions = true;
    }



  }
}
