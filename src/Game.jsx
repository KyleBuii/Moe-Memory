import { memo, useEffect, useRef, useState } from 'react';
import './Game.scss';

const Game = () => {
    const [score, setScore] = useState(0);
    const [highscore, setHighscore] = useState(0);
    const [cards, setCards] = useState([]);
    const [clickedCards, setClickedCards] = useState([]);
    const [nsfwMode, setNsfwMode] = useState('');
    const [isGameOver, setIsGameOver] = useState(false);

    const refHighscore = useRef(highscore);

    useEffect(() => {
        window.addEventListener('beforeunload', storeData);

        const localStorageHighscore = localStorage.getItem('highscore');
        if (localStorageHighscore) setHighscore(localStorageHighscore);

        setClickedCards([]);
        fetchImages();

        return () => {
            window.removeEventListener('beforeunload', storeData);
            storeData();
        };
    }, []);

    useEffect(() => {
        refHighscore.current = highscore;
    }, [highscore]);

    const storeData = () => {
        localStorage.setItem('highscore', refHighscore.current);
    };

    const fetchImages = async () => {
        const URL = `https://api.waifu.im/search?limit=12${nsfwMode && `&is_nsfw=${nsfwMode}`}`;
        
        try {
            const response = await fetch(URL);
            const data = await response.json();
            let newArray = [...cards];

            if (isGameOver) {
                setIsGameOver(false);
                newArray = [];
            };

            data.images.forEach((image) => {
                newArray.push(image.url);
            });
            setCards(newArray);
        } catch (err) {
            console.error('An error occurred:', err.message);
        };
    };

    const handleClick = (event, card) => {
        if (isGameOver) {
            const wrongCard = document.querySelector('.wrong');
            wrongCard.classList.remove('wrong');

            setScore(0);
            fetchImages();
        };

        const clickedCardName = card.match(/([^/]+)(.jp[e]?g|png|gif|webp)/)[1];
        const clickedCard = event.target;

        if (clickedCards.includes(clickedCardName)) {
            clickedCard.classList.add('wrong');
            gameOver();
            return;
        };

        clickedCards.push(clickedCardName);

        setScore((prevScore) => {
            const newScore = prevScore + 1;
            if (newScore === cards.length) {
                fetchImages();
                shuffle();
            };

            return newScore;
        });

        shuffle();
    };

    const gameOver = () => {
        if (score > highscore) setHighscore(score);
        setIsGameOver(true);
        setClickedCards([]);
    };

    const shuffle = () => {
        let copyArray = [...cards];
        let currentIndex = cards.length;

        while (currentIndex !== 0) {
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [copyArray[currentIndex], copyArray[randomIndex]] = [copyArray[randomIndex], copyArray[currentIndex]];
        };

        setCards(copyArray);
    };

    const handleToggleButton = (event) => {
        setNsfwMode(!nsfwMode);
        event.target.classList.toggle('toggled');
    };

    return (
        <div>
            <section className='header'>
                <h1>Anime Memory Card Game</h1>
                <div className='scores'>
                    <button className='button-toggle'
                        onClick={(event) => handleToggleButton(event)}>NSFW</button>
                    <span>Score: {score}</span>
                    <span>Highscore: {highscore}</span>
                </div>
            </section>
            <section className='game-board'>
                <h2 className='screen-reader-only'>Game</h2>
                {cards.map((card, index) => {
                    return <span className='card'
                        key={`card-${index}`}
                        onClick={(event) => handleClick(event, card)}>
                        <img src={card}
                            alt={`card-${index}`}
                            loading='lazy'
                            decoding='async'/>
                    </span>
                })}
            </section>
            <footer>
                <span>
                    Made by <a href='https://github.com/KyleBuii/Moe-Memory'>Kyle Bui</a>
                </span>
                <span>
                    Icon by <a href='https://www.vecteezy.com/free-vector/woman"'>Vecteezy</a>
                </span>
            </footer>
        </div>
    );
};

export default memo(Game);