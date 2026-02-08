import { TranslateHttpLoader } from '@ngx-translate/http-loader';

/**
 * Factory function for creating TranslateHttpLoader
 * Uses the new v17+ API with injection
 *
 * @returns TranslateHttpLoader instance
 */
export function createTranslateLoader(): TranslateHttpLoader {
  return new TranslateHttpLoader();
}
