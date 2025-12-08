import { NgModule } from '@angular/core';
import { HttpClientModule, HttpBackend } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import {
  TranslateHttpLoader,
  TRANSLATE_HTTP_LOADER_CONFIG,
  provideTranslateHttpLoader
} from '@ngx-translate/http-loader';

/**
 * I18n Module
 *
 * Provides internationalization support using ngx-translate.
 * Configured to load translation files from /assets/i18n/
 *
 * Supported languages:
 * - it (Italian) - Primary language
 * - en (English)
 * - fr (French)
 * - de (German)
 * - es (Spanish)
 */
@NgModule({
  imports: [
    HttpClientModule,
    TranslateModule.forRoot({
      defaultLanguage: 'it',
      loader: {
        provide: TranslateLoader,
        useClass: TranslateHttpLoader
      }
    })
  ],
  providers: [
    {
      provide: TRANSLATE_HTTP_LOADER_CONFIG,
      useValue: {
        prefix: './assets/i18n/',
        suffix: '.json'
      }
    }
  ],
  exports: [TranslateModule]
})
export class I18nModule { }
