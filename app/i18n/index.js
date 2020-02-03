import i18n from 'i18next';
import backend from 'i18next-xhr-backend';

i18n
    .use(backend)
    .init({
        loadPath: '/locales/{{lng}}/{{ns}}.json',
        debug: __DEV__,
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

export default i18n;
