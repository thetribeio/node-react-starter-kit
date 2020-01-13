import React, { useCallback, useState } from 'react';

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

    return (
        <div>
            <img alt="Starter kit theTribe" src={banner} />
            <h1 className={styles.title} id="hello-world">hello world</h1>
            <button id="click-me" onClick={onClick} type="button">
                {`You clicked ${count} times`}
            </button>
        </div>
    );
};

export default Home;
