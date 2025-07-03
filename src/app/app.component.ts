
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonRouterLink } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, heartOutline, heartSharp, archiveOutline, archiveSharp, trashOutline, trashSharp, warningOutline, warningSharp, bookmarkOutline, bookmarkSharp } from 'ionicons/icons';
import { Platform } from '@ionic/angular';
import { SqliteService } from './services/sql-lite.service';
import { AppTranslateService } from '../app/services/translate.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [RouterLink, RouterLinkActive, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader,  IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterLink, IonRouterOutlet],
})
export class AppComponent {
  public appPages = [
    { title: 'Inicio', url: 'start', icon: 'mail' },

  ];
  public labels = [];
  constructor(public platform: Platform,
     private sqliteService: SqliteService
     , private translateService: AppTranslateService) {
    addIcons({ mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, heartOutline, heartSharp, archiveOutline, archiveSharp, trashOutline, trashSharp, warningOutline, warningSharp, bookmarkOutline, bookmarkSharp });
    this.initializeApp()
  }

   async initializeApp() {
    await this.platform.ready();

    try {
      await this.sqliteService.initDB();
      console.log('SQLite initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SQLite:', error);
    }
  }
}
