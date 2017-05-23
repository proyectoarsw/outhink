import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { BasePage } from '../pages/base/base';
import { PasswordPage } from '../pages/password/password';
import { AvailabilityPage } from '../pages/availability/availability';
import { PopoverPage } from '../pages/popover/popover';
import { ChatPage } from '../pages/chat/chat';
import { WorkloadPage } from '../pages/workload/workload';
import { ChartsModule } from 'ng2-charts';
import '../../node_modules/chart.js/dist/Chart.bundle.min.js';
import { CloudSettings, CloudModule } from '@ionic/cloud-angular';
import { BrowserModule } from '@angular/platform-browser';
import { ServicesProvider } from '../providers/services/services';
import { IonicStorageModule } from '@ionic/storage';

const cloudSettings: CloudSettings = {
  'core': {
    'app_id': '82a189c0'
  },
  'push': {
    'sender_id': '12341234',
    'pluginConfig': {
      'ios': {
        'badge': true,
        'sound': true
      },
      'android': {
        'iconColor': '#343434'
      }
    }
  }
};

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    LoginPage,
    BasePage,
    PopoverPage,
    PasswordPage,
    AvailabilityPage,
    ChatPage,
    WorkloadPage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    ChartsModule,
    BrowserModule,
    CloudModule.forRoot(cloudSettings)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    LoginPage,
    BasePage,
    PopoverPage,
    PasswordPage,
    AvailabilityPage,
    ChatPage,
    WorkloadPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler},
    ServicesProvider]
})
export class AppModule {}
