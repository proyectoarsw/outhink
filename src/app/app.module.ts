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
import { ChartsModule } from 'ng2-charts';
import '../../node_modules/chart.js/dist/Chart.bundle.min.js';

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
    ChatPage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    ChartsModule
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
    ChatPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {}
