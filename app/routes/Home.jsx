import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './Home.scss';
import banner from '../images/StarterKitTheTribe.png';

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

    return (
        <div>
            <img src={banner} alt="Starter kit theTribe" />
            <h1 id="hello-world" className={styles.title}>{t('helloWorld')}</h1>
            <button id="click-me" type="button" onClick={onClick}>
                {t('buttons:youClicked', { count })}
            </button>
            <button id="translate" type="button" onClick={() => i18n.changeLanguage('en' === i18n.language ? 'fr' : 'en')}>
                {t('buttons:translate')}
            </button>
        </div>
    );
};

export default Home;
