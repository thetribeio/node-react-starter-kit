import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import banner from '../images/StarterKitTheTribe.png';
import styles from './Home.scss';

const Home = () => {
    const [count, setCount] = useState(0);

    const onClick = useCallback(async () => {
        const response = await fetch('/example/click', {
            method: 'POST',
        });

        if (response.ok) {
            setCount(count + 1);
        }
    }, [count, setCount]);

    const { t, i18n } = useTranslation(['translation', 'buttons']);

    const changeLanguage = useCallback(() => {
        i18n.changeLanguage('en' === i18n.language ? 'fr' : 'en');
    }, [i18n]);

    return (
        <div>
            <img alt="Starter kit theTribe" src={banner} />
            <h1 className={styles.title} id="hello-world">{t('helloWorld')}</h1>
            <button id="click-me" onClick={onClick} type="button">
                {t('buttons:youClicked', { count })}
            </button>
            <button id="translate" onClick={changeLanguage} type="button">
                {t('buttons:translate')}
            </button>
        </div>
    );
};

export default Home;
