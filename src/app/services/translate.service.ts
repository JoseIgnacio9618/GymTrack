import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export const LANGUAGES = [
  { code: 'es', labelKey: 'LANG.ES' },
  { code: 'en', labelKey: 'LANG.EN' },
  { code: 'fr', labelKey: 'LANG.FR' },
  { code: 'de', labelKey: 'LANG.DE' },
  { code: 'it', labelKey: 'LANG.IT' },
  { code: 'pt', labelKey: 'LANG.PT' },
  { code: 'nl', labelKey: 'LANG.NL' },
  { code: 'pl', labelKey: 'LANG.PL' },
  { code: 'ru', labelKey: 'LANG.RU' },
  { code: 'ja', labelKey: 'LANG.JA' },
  { code: 'zh', labelKey: 'LANG.ZH' },
  { code: 'ar', labelKey: 'LANG.AR' },
  { code: 'tr', labelKey: 'LANG.TR' },
  { code: 'uk', labelKey: 'LANG.UK' },
  { code: 'ca', labelKey: 'LANG.CA' },
  { code: 'el', labelKey: 'LANG.EL' },
  { code: 'hi', labelKey: 'LANG.HI' },
  { code: 'ko', labelKey: 'LANG.KO' },
] as const;

const SUPPORTED_CODES = new Set([
  'es', 'en', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'ru', 'ja', 'zh', 'ar', 'tr', 'uk', 'ca', 'el', 'hi', 'ko'
]);

@Injectable({ providedIn: 'root' })
export class AppTranslateService {
  readonly defaultLang = 'es';

  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang(this.defaultLang);
    const savedLang = localStorage.getItem('gymtrack_lang');
    const langToUse = savedLang && SUPPORTED_CODES.has(savedLang)
      ? savedLang
      : this.defaultLang;
    this.translate.use(langToUse);
  }

  setLanguage(lang: string): void {
    if (!SUPPORTED_CODES.has(lang)) return;
    this.translate.use(lang);
    localStorage.setItem('gymtrack_lang', lang);
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || this.defaultLang;
  }

  getLanguages() {
    return LANGUAGES;
  }
}
