import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class AppTranslateService {
  private defaultLang = 'es';

  constructor(private translate: TranslateService) {
    const savedLang = localStorage.getItem('lang');
    const browserLang = translate.getBrowserLang();

    const langToUse = savedLang || (browserLang?.match(/en|es/) ? browserLang : this.defaultLang);

    this.translate.setDefaultLang(this.defaultLang);
    this.translate.use(langToUse);
  }

  setLanguage(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || this.defaultLang;
  }
}
