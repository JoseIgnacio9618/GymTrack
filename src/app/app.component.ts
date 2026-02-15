import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonRouterLink, IonSpinner, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, heartOutline, heartSharp, archiveOutline, archiveSharp, trashOutline, trashSharp, warningOutline, warningSharp, bookmarkOutline, bookmarkSharp, logOutOutline, languageOutline } from 'ionicons/icons';
import { Platform } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { AppTranslateService } from './services/translate.service';
import { AuthService } from './services/auth.service';
import { LANGUAGES } from './services/translate.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    CommonModule,
    TranslateModule,
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonSplitPane,
    IonMenu,
    IonContent,
    IonList,
    IonListHeader,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterLink,
    IonRouterOutlet,
    IonSpinner,
    IonSelect,
    IonSelectOption,
  ],
})
export class AppComponent {
  readonly appPages = [{ titleKey: 'MENU.HOME', url: 'start', icon: 'mail' }];
  readonly languages = LANGUAGES;
  public labels: string[] = [];
  /** Solo se muestra la app cuando la BD y la sesión están listas. */
  appReady = false;

  constructor(
    public platform: Platform,
    public translateService: AppTranslateService,
    public authService: AuthService,
    private router: Router,
  ) {
    addIcons({
      mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp,
      heartOutline, heartSharp, archiveOutline, archiveSharp,
      trashOutline, trashSharp, warningOutline, warningSharp,
      bookmarkOutline, bookmarkSharp, logOutOutline, languageOutline,
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
