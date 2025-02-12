import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { Container, Row, Col, Alert } from 'react-bootstrap';
import { Route, Routes, Outlet, useNavigate} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LoginForm } from './components/AuthComponents';

import Header from './components/Header';
import HomePage from './components/HomePage';
import GamePage from './pages/GamePage';
import ProfilePage from './pages/ProfilePage';
import SummaryPage from './pages/SummaryPage';
import './components/Style.css';
import API from './API.mjs';

function App() {
  //useState, useEffect, useContext sono hook cioè caratteristica di React che permette di utilizzare
  //lo stato e altre funzionalità di React nei componenti funzionali, cioè quelli definiti come funzioni, invece che come classi.
  //useState() -> Permette di aggiungere lo stato locale al componente funzionale.
  const [loggedIn, setLoggedIn] = useState(false); 
  const [message, setMessage] = useState(''); 
  const [user, setUser] = useState(''); 
  const [scoreTot, setScoreTot] = useState(0);
  const [rounds, setRounds] = useState([]);
  const [allMemes, setAllMemes] = useState([]); // Stato per memorizzare tutti i meme usciti

  //useContext() -> Permette di accedere a valori nel contesto senza dover passare esplicitamente le props.

  //useEffect() -> Permette di eseguire effetti collaterali (side effects) come fetch di dati, 
  //aggiornamenti del DOM, e altro, in componenti funzionali.
  // useEffect() viene attivato:
  // - Al Montaggio: Se non viene specificato l'array delle dipendenze, l'effetto viene eseguito ad ogni render. 
  //                 Se si specifica l'array delle dipendenze, l'effetto viene eseguito quando le dipendenze cambiano.
  // - Al cambio di dipendenze: Se si specifica l'array delle dipendenze, l'effetto viene eseguito di nuovo ogni volta che una delle dipendenze cambia.
  // - Allo scmontaggio: Se la funzione di effetto restituisce una funzione di cleanup, questa viene eseguita quando il componente si smonta 
  //                     o prima che l'effetto successivo venga eseguito (se le dipendenze cambiano).

  // Renderizzare un componente significa visualizzarlo all'interno del DOM. 
  // In React, il rendering si riferisce al processo attraverso il quale un componente React produce l'interfaccia utente (UI) da visualizzare all'utente. 
  // Ogni volta che lo stato o le props di un componente cambiano, React "renderizza" di nuovo quel componente per riflettere le modifiche nell'interfaccia utente.
  useEffect(() => {
    // recupero tutti i meme dal server
    const getMemes = async () => {
      const memes = await API.getMemes();
      setMemes(memes);
    }
    getMemes();
  }, []);

  useEffect(() => {
    // recupero tutte le captions dal server
    const getCaptions = async () => {
      const captions = await API.getCaptions();
      setCaptions(captions);
    }
    getCaptions();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await API.getUserInfo(); 
      setLoggedIn(true);
      setUser(user);
    };
    checkAuth();
  }, []);

  //useNavigate() è un hook di React Router che restituisce una funzione 
  //che permette di spostarsi programmaticamente tra le diverse pagine (rotte) dell'applicazione.
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setLoggedIn(true);
      setMessage({msg: `Welcome, ${user.name}!`, type: 'success'});
      setUser(user);
      navigate('/game');
    }catch(err) {
      setMessage({msg: err, type: 'danger'});
    }
  };

  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    setMessage('');
  };

  const handleGameOver = (score, rounds, allMemesRound) => {
    setScoreTot(score);
    setRounds(rounds);
    navigate('/summary');
  };

  useEffect(() => {
    if (message) {
      // Imposta un timer che esegue la funzione fornita dopo 2000 millisecondi (2 secondi). 
      // La funzione fornita aggiorna lo stato del messaggio, impostandolo a una stringa vuota (''), 
      // il che in pratica nasconde il messaggio.
      const timer = setTimeout(() => setMessage(''), 2000);
      // funzione di pulizia che viene eseguita se il componente si smonta 
      // o se l'effetto viene rieseguito prima che il timer scada. 
      // clearTimeout(timer) cancella il timer per evitare che la funzione venga eseguita se non è più necessaria.
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <>
      <Header loggedIn={loggedIn} handleLogout={handleLogout} user={user} />
      <Container fluid className='mt-3'>
        {message && (
          <Row className="justify-content-center">
            <Col md={6} lg={4}>
              <Alert variant={message.type} onClose={() => setMessage('')} dismissible>
                {message.msg}
              </Alert>
            </Col>
          </Row>
        )}
        <Outlet/>
      </Container>
      <Routes>
        <Route path="/" element={<HomePage loggedIn={loggedIn} />} />
        <Route path="/game" element={<GamePage user={user} loggedIn={loggedIn} onGameOver={handleGameOver} />} />
        <Route path="/login" element={<LoginForm login={handleLogin}/>} />
        <Route path="/profile" element={<ProfilePage user={user} allMemes={allMemes} />} /> 
        <Route path="/summary" element={<SummaryPage scoreTot={scoreTot} rounds={rounds} />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </>
  );
}

export default App;
