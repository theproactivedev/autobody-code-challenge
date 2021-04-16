import { useState } from 'react';
import base64 from 'base-64';
import './App.css';
import { API_BASE, USERNAME, PASSWORD, APPLICANT_ID } from './constants';

const request = (url, method, body) => {
  const auth = `${USERNAME}:${PASSWORD}`;
  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${base64.encode(auth)}`,
    },
    body: JSON.stringify(body)
  });
}

const App = () => {
  const [gameId, setGameId] = useState('');
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState('')
  const [isError, showErrorMsg] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startGame = () => {
    request(API_BASE + '/game', 'POST', { applicantId: APPLICANT_ID, })
    .then(res => res.json())
    .then(data => {
      if(data) {
        setGameId(data.gameId);
      }
    })
    .catch(e => console.log(e));
  }

  const submitGuess = (e) => {
    e.preventDefault();
    if(!guess) {
      showErrorMsg(true);
    } else {
      setIsSubmitting(true);
      request(API_BASE + '/game', 'PUT', { 
        applicantId: APPLICANT_ID,
        gameId: gameId,
        guess: parseInt(guess)
      })
      .then(res => res.json())
      .then(data => {
        if(data && data.result) {
          if(data.result === 'higher') {
            setResult('Guess a higher a number.')
          } else if(data.result === 'lower') {
            setResult('Guess a lower a number.')
          } else if(data.result === 'correct') {
            setResult('Congratulations! You solved it. Great job!')
          }
        }
        setIsSubmitting(false);
      })
      .catch(e => {
        console.log(e);
        setIsSubmitting(false); 
      });
    }
  }

  return (
    <main className="app">
      {gameId === '' &&
        <section>
          <h1>Hello!</h1>
          <p>Let's play a game. I'll pick an integer between 0 and 1,000,000. You submit guesses and I'll tell you whether it should be higher or lower than that.</p>
          <button className="flow-btn__basic" onClick={() => startGame()}>Start Game!</button>
        </section>
      }
      {gameId && gameId.length && !result.includes('Congratulations') &&
        <form>
          <div className="flow-form-group">
            <label htmlFor="guess"><span>*</span> Enter a number from 0 to 1,000, 000:</label>
            <input type="number" id="guess" placeholder="Type a number" value={guess}
              onChange={(e) => {
                setGuess(e.target.value);
                showErrorMsg(false);
              }}
              required
            />
            {isError && <span className="flow-error-msg">Please enter a number.</span>}
          </div>
          <input className="flow-btn__basic" type="submit" value="Submit" onClick={(e) => submitGuess(e)} />
        </form>
      }
      {result &&
        <section className={`flow-result ${result.includes('Congratulations') && 'flow-success-msg'}`}>
          {isSubmitting &&
            <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
          }
          {!isSubmitting &&
            <>
              <h1>{guess}</h1>
              <p>{result}</p>
            </>
          }
        </section>
      }
    </main>
  );
}

export default App;
