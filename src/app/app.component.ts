import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonRouterLink, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, heartOutline, heartSharp, archiveOutline, archiveSharp, trashOutline, trashSharp, warningOutline, warningSharp, bookmarkOutline, bookmarkSharp, logOutOutline } from 'ionicons/icons';
import { Platform } from '@ionic/angular';
import { AppTranslateService } from './services/translate.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [CommonModule, RouterLink, RouterLinkActive, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterLink, IonRouterOutlet, IonSpinner],
})
export class AppComponent {
  public appPages = [
    { title: 'Inicio', url: 'start', icon: 'mail' },
  ];
  public labels: string[] = [];
  /** Solo se muestra la app cuando la BD y la sesión están listas. */
  appReady = false;

  constructor(
    public platform: Platform,
    private translateService: AppTranslateService,
    public authService: AuthService,
    private router: Router,
  ) {
    addIcons({
      mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp,
      heartOutline, heartSharp, archiveOutline, archiveSharp,
      trashOutline, trashSharp, warningOutline, warningSharp,
      bookmarkOutline, bookmarkSharp, logOutOutline,
    });
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready();
    try {
      await this.authService.initSession();
    } catch (err) {
      console.error('Init error:', err);
    }
    this.appReady = true;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth'], { replaceUrl: true });
  }
}
