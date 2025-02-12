// imports
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import {check, validationResult} from 'express-validator';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Passport-related imports 
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';

import {getUser} from './user-dao.mjs';
import { listMemes, getRandomMeme, listCaptions, listCorrectCaptionsOf, listIncorrectCaptionsOf, getRandomCaptions, saveScore, getUserScores, saveGameRounds, getUserRounds } from './mc-dao.mjs';

// init
// Express è un framework web per Node.js, progettato per rendere facile e veloce la costruzione di applicazioni web e API. 
// Fornisce una serie di funzionalità potenti e flessibili per gestire le richieste HTTP, le risposte, i middleware, il routing, la gestione degli errori ecc...
const app = express();
const port = 3001;

// middleware -> funzioni in un'applicazione Express.js che gestiscono le richieste HTTP.
//               Ogni middleware ha accesso all'oggetto request, response, e alla funzione next.
app.use(express.json());
// Morgan è un middleware di logging HTTP per Node.js. È utilizzato per registrare le richieste HTTP fatte al server.
// In questo caso si utilizza Morgan come middleware con il formato di log 'dev'. 
// Questo formato fornisce log dettagliati con informazioni utili per lo sviluppo, come il metodo HTTP, il percorso, il tempo di risposta, e il codice di stato.
app.use(morgan('dev'));
// CORS -> CORS è uno standard di sicurezza implementato dai browser per controllare le richieste HTTP effettuate 
//         da un'origine differente dal dominio a cui la richiesta viene inviata.
//         Senza CORS, il browser blocca tali richieste per prevenire attacchi di tipo CSRF e altre minacce di sicurezza.
// set up and enable CORS -- UPDATED
const corsOptions = {
  origin: 'http://localhost:5173', // Permette richieste solo da questo dominio
  optionsSuccessStatus: 200, // Imposta lo status di successo
  credentials: true // Permette l'invio di credenziali (cookie, header di autenticazione, ecc.)
};
app.use(cors(corsOptions)); // Applica le opzioni CORS come middleware


// Passport -> middleware di autenticazione per Node.js
// set up local strategy 
//cb è una funzione di callback che viene chiamata per segnalare il risultato di un'operazione asincrona. 
//È utilizzata da passport per comunicare i risultati dell'autenticazione al middleware che ha invocato la strategia. 
//Tipicamente, cb segue la convenzione Node.js, ovvero accetta tre argomenti:
// - Error: Il primo argomento è un errore (o null se non ci sono errori).
// - User: Il secondo argomento è l'utente autenticato (o false se l'autenticazione fallisce).
// - Info: Un messaggio opzionale o un ulteriore oggetto informativo.
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await getUser(username, password);
  if(!user)
    return cb(null, false, 'Incorrect username or password.');
    
  return cb(null, user);
}));

// serializeUser: Viene chiamato durante l'autenticazione per determinare cosa viene salvato nella sessione.
passport.serializeUser(function (user, cb) {
  cb(null, user);
});

// deserializeUser: Viene chiamato ogni volta che una richiesta viene effettuata per recuperare l'utente autenticato dai dati salvati nella sessione.
passport.deserializeUser(function (user, cb) { // this user is id + email + name
  return cb(null, user);
});

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}

app.use(session({
  secret: "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));

// Configurazione di Express per servire file statici dalla cartella "public" 
// Senza questa configurazione il client non potrebbe accedere alle risorse statiche
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, 'public')));

// Interazione Server-Client -> il server e il client interagiscono tramite richieste HTTP. 
// Il client (tipicamente un browser) invia richieste al server, che risponde con le risorse richieste (HTML, JSON, immagini, ecc.).
// Il client può fare richieste di GET per ottenere una pagina HTML o richieste API per ottenere dati dinamici (in questo caso il server risponde con i file JSON richiesti)

/* ROUTES */

// POST /api/sessions 
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).send(info);
      }
      // success, perform the login
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        return res.status(201).json(req.user);
      });
  })(req, res, next);
});


// GET /api/sessions/current 
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.json(req.user);}
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current 
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});

// GET /api/game/memes
app.get('/api/game/memes', (request, response) => {
  listMemes()
  .then(memes => response.json(memes))
  .catch(() => response.status(500).end());
});

// GET /api/game/captions
app.get('/api/game/captions', (request, response) => {
  listCaptions()
  .then(captions => response.json(captions))
  .catch(() => response.status(500).end());
});

// GET /api/game/memes/<id>/correctcaptions
app.get('/api/game/memes/:id/correctcaptions', async (req, res) => {
  try {
    const answers = await listCorrectCaptionsOf(req.params.id);
    res.json(answers);
  } catch {
    res.status(500).end();
  }
});

// GET /api/game/memes/<id>/incorrectcaptions
app.get('/api/game/memes/:id/incorrectcaptions', async (req, res) => {
  try {
    const answers = await listInorrectCaptionsOf(req.params.id);
    res.json(answers);
  } catch {
    res.status(500).end();
  }
});

app.get('/api/game/round', async (req, res) => {
  try {
    const excludedMemeIds = req.query.excludedMemeIds ? req.query.excludedMemeIds.split(',') : [];
    const meme = await getRandomMeme(excludedMemeIds);
    const correctCaptions = await listCorrectCaptionsOf(meme.id);
    const otherCaptions = await getRandomCaptions(5, correctCaptions.map(c => c.id), correctCaptions.map(c => c.text), meme.id);

    const captions = [...correctCaptions, ...otherCaptions]
      .sort(() => Math.random() - 0.5); // Shuffle captions

    res.json({ meme, captions});
  } catch (error) {
    console.error('Failed to fetch round data:', error);
    res.status(500).json({ error: 'Failed to fetch round data' });
  }
});

app.post('/api/game/saveScore', async (req, res) => {
  try {
    const { userId, score } = req.body;

    // Salvo il punteggio nel database 
    await saveScore(userId, score);

    res.status(200).json({ message: 'Score saved successfully' });
  } catch (error) {
    console.error('Error saving score:', error);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

app.get('/api/scores/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const scores = await getUserScores(userId);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero dei punteggi' });
  }
});


app.post('/api/game/saveGameRounds', async (req, res) => {
  const { userId, score, rounds } = req.body;
  
  try {
    // Salva i round
    await saveGameRounds(userId, rounds);

    res.status(200).json({ message: 'Game rounds saved successfully' });
  } catch (err) {
    console.error('Failed to save game rounds in index.mjs', err);
    res.status(500).json({ error: 'Failed to save game rounds' });
  }
});


app.get('/api/rounds/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const rounds = await getUserRounds(userId);

    res.json(rounds);
  } catch (err) {
    console.error('Failed to fetch user rounds', err);
    res.status(500).json({ error: 'Failed to fetch user rounds' });
  }
});

// far partire il server
app.listen(port, () => { console.log(`API server started at http://localhost:${port}`); });