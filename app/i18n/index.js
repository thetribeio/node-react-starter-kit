import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from '../../public/locales/en/translation.json';
import enButtons from '../../public/locales/en/buttons.json';
import frTranslation from '../../public/locales/fr/translation.json';
import frButtons from '../../public/locales/fr/buttons.json';

const loadI18n = () => i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: enTranslation,
                buttons: enButtons,
            },
            fr: {
                translation: frTranslation,
                buttons: frButtons,
            },
        },
        debug: __DEV__,
        whitelist: ['en', 'fr'],
        lng: 'en',
        fallbackLng: 'en',
        // Differents namespaces may be loaded individually when using `useTranlation` for performance concern
        // https://react.i18next.com/guides/multiple-translation-files
        namespaces: ['translation', 'buttons'],
        defaultNS: 'translation',
        interpolation: {
            escapeValue: false,
        },
    });

export default loadI18n;
