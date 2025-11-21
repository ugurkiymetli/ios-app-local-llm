import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import en from './en';
import tr from './tr';

const i18n = new I18n({
  en,
  tr,
});

i18n.enableFallback = true;
i18n.locale = getLocales()[0].languageCode ?? 'en';

export default i18n;
