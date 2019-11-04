import React, { useState } from 'react';
import BookList from '../components/BookList';
import styles from './Home.scss';
import banner from '../images/StarterKitTheTribe.png';

const Home = () => {
    const [count, setCount] = useState(0);

    return (
        <div>
            <img src={banner} alt="Starter kit theTribe" />
            <h1 id="hello-world" className={styles.title}>hello world</h1>
            <button id="click-me" type="button" onClick={() => setCount(count + 1)}>
                {`You clicked ${count} times`}
            </button>
            <BookList />
        </div>
    );
};

export default Home;
