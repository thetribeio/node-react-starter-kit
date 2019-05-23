import React, { useState } from 'react';
import styles from './Home.scss';

const Home = () => {
    const [count, setCount] = useState(0);

    return (
        <div>
            <h1 id="hello-world" className={styles.title}>hello world</h1>
            <button id="click-me" type="button" onClick={() => setCount(count + 1)}>
                {`You clicked ${count} times`}
            </button>
        </div>
    );
};

export default Home;
