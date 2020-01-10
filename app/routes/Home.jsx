import React, { useCallback, useState } from 'react';
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

    return (
        <div>
            <img src={banner} alt="Starter kit theTribe" />
            <h1 id="hello-world" className={styles.title}>hello world</h1>
            <button id="click-me" type="button" onClick={onClick}>
                {`You clicked ${count} times`}
            </button>
        </div>
    );
};

export default Home;
