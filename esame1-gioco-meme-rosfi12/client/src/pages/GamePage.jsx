import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../API.mjs';
import '../components/Style.css';

function GamePage(props) {
  const [meme, setMeme] = useState(null);
  const [captions, setCaptions] = useState([]);
  const [selectedCaption, setSelectedCaption] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [excludedMemeIds, setExcludedMemeIds] = useState([]);
  const [correctCaptions, setCorrectCaptions] = useState([]);
  const [timer, setTimer] = useState(30);
  const [timerRunning, setTimerRunning] = useState(true);
  const [roundsData, setRoundsData] = useState([]);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctRounds, setCorrectRounds] = useState([]); //serve per summary

  const maxRounds = props.loggedIn ? 3 : 1;
  const navigate = useNavigate();

  useEffect(() => {
    const handleRoundData = async () => {
      const data = await API.fetchRoundData(excludedMemeIds);
      setMeme(data.meme);
      setCaptions(data.captions);
      setCorrectCaptions(data.captions.filter(caption => caption.memeId === data.meme.id));
      setExcludedMemeIds([...excludedMemeIds, data.meme.id]);
      setTimer(30);
      setTimerRunning(true);
    };
    handleRoundData();
  }, [round]);

  useEffect(() => {
    if (timerRunning && timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      // funzione di pulizia che viene eseguita quando l'effetto viene rieseguito o quando il componente si smonta. 
      // clearTimeout(countdown) cancella il timer impostato con setTimeout, impedendo 
      // che la funzione fornita venga eseguita se non è più necessaria (ad esempio, se il componente si smonta prima che il timer scada).
      return () => clearTimeout(countdown);
    } else if (timer === 0) {
      handleConfirm(true); // Considero time over come risposta sbagliata
    }
  }, [timer, timerRunning]);

  const handleConfirm = (timeExpired = false) => {
    setTimerRunning(false); // Stoppo il timer
    let correct = false;
    // Verifico se c'è una caption selezionata correttamente
    if (selectedCaption && selectedCaption.memeId === meme.id && !timeExpired) {
      correct = true;
    }
    setIsCorrect(correct);
    const roundData = {
      meme,
      selectedCaption,
      correctCaptions,
      isCorrect: correct, // Aggiungo se la selezione è corretta
    };

    const memeAlreadyIncluded = roundsData.some(data => data.meme.id === meme.id);

    if (!memeAlreadyIncluded) {
      setRoundsData([...roundsData, roundData]);
    }

    if (correct) {
      if (props.loggedIn) {
        setScore(score + 5);
        setModalMessage(`Corretto! \nHai ottenuto 5 punti!\nIl tuo punteggio ora è ${score + 5}`);
        setCorrectRounds([...correctRounds, roundData]);
      } else {
        setModalMessage(`Corretto! \nEffettua il login per tenere traccia dei tuoi punteggi`);
      }
    } else if (timeExpired) {
      setModalMessage(`Tempo scaduto! Le caption corrette erano:\n${correctCaptions.map(caption => caption.text).join('\n')}`);
    } else {
      setModalMessage(`Sbagliato! Le caption corrette erano:\n${correctCaptions.map(caption => caption.text).join('\n')}`);
    }
    setShowModal(true);
    setSelectedCaption(null);
  };

  const handleCloseModal = async () => {
    setShowModal(false);
    if (round < maxRounds - 1) {
      setRound(round + 1);
    } else {
      setIsCorrect(true);
      if (props.loggedIn) {
        await API.saveGameRounds(props.user.id, score, roundsData); // Salva i dati del gioco
        setIsRedirecting(true); //Nel momento in cui è true parte il modale scritto in fondo che richiama renderSummary
        setTimeout(() => {
          props.onGameOver(score, correctRounds); // Passa anche tutti i meme usciti e reindirizza alla pagina di summary
        }, 5000);
      } else {
        setModalMessage(`Game Over! Stai per essere reindirizzato alla pagina iniziale...`);
        setIsRedirecting(true);
        setShowModal(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    }
  };

  const renderSummary = () => {
    return (
      <div>
        <h4>Meme indovinati:</h4>
        <ul>
          {correctRounds.map((roundData, index) => (
            <li key={index}>
              <img src={`http://localhost:3001/${roundData.meme.url}`} alt="Meme" className="img-fluid mb-2" style={{ maxWidth: '50px', marginRight: '10px' }} />
              <span>{roundData.selectedCaption.text}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <Container fluid className="game-page-container p-4">
      <Row>
        <Col md={6} className="d-flex flex-column align-items-center">
          {meme && (
            <>
              <img src={`http://localhost:3001/${meme.url}`} alt="Meme" className="img-round mb-4" style={{ maxWidth: '100%' }} />
            </>
          )}
        </Col>
        <Col md={6}>
          <Row>
            <Col xs={12} className="text-center mb-4">
              <h3 className='round-scritta'>Round {round + 1}</h3>
              <h4 className='punt-parziale-scritta'>Punteggio parziale: {score}</h4>
            </Col>
            <Col xs={12} className="text-right mb-4">
              <span className="timer-oval">{timer} secondi</span>
            </Col>
            {captions.map((caption, index) => (
              <Col xs={6} key={index} className="mb-4">
                <Card
                  className={`text-center ${selectedCaption === caption ? 'selected-caption' : ''}`}
                  onClick={() => setSelectedCaption(caption)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Body>
                    <Card.Text>{caption.text}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <Button variant="primary" onClick={() => handleConfirm(false)} className="button-conferma-endgame-next" disabled={!selectedCaption}>Conferma</Button>
        </Col>
      </Row>

      { /* show mostra o meno il modale e viene definito dallo stato showModal */ }
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="modal-center">
        <Modal.Body className="d-flex align-items-center">
          {isCorrect ? <Image src="http://localhost:3001/ok.jpg" roundedCircle fluid className='img-ok-no' />
           : <Image src="http://localhost:3001/no.jpg" roundedCircle fluid className='img-ok-no' />}
          <span>
            {modalMessage.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </span>
        </Modal.Body>
        <Modal.Footer>
          {!isRedirecting && (
            <Button variant="primary" onClick={handleCloseModal} className="button-conferma-endgame-next">
              {round < maxRounds - 1 ? 'Next Round' : 'End Game'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <Modal show={isRedirecting && props.loggedIn} onHide={() => setShowModal(false)} centered className="modal-center">
        <Modal.Body className="text-center">
          <h4>Game Over! Il tuo punteggio finale è {score}.</h4>
          {renderSummary()}
        </Modal.Body>
        <Modal.Footer>
          Attendi un istante...
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default GamePage;
