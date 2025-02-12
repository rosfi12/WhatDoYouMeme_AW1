//viene chiamato dal client e lui chiama index.mjs che chiama mc-dao
import {Meme, Caption} from '../../server/MCModels.mjs'
const SERVER_URL = 'http://localhost:3001';

const logIn = async (credentials) => {
    // /sesion è l'endpoint nell'API del server ovvero una specifica URL dove il server ascolta le richieste HTTP
    const response = await fetch(SERVER_URL + '/api/sessions', {
      method: 'POST',
      //Gli headers sono informazioni aggiuntive inviate con la richiesta HTTP
      // 'Content-Type': 'application/json' specifica che il corpo della richiesta contiene dati JSON. 
      // Questo è importante perché il server deve sapere come interpretare i dati inviati.
      headers: {
        'Content-Type': 'application/json',
      },
      // Indica se i cookie devono essere inclusi con la richiesta. 
      // 'include' significa che i cookie saranno inviati con la richiesta, anche se la richiesta è cross-origin 
      // (richieste HTTP fatte da un'origine a un dominio, protocollo diversi cioè origine B).
      // Le altre opzioni sono 'same-origin' (i cookie sono inclusi solo se la richiesta è dello stesso dominio) 
      // e 'omit' (i cookie non sono mai inclusi).
      credentials: 'include',
      // body è il corpo della richiesta, ovvero i dati che vengono inviati al server.
      // JSON.stringify(credentials) converte l'oggetto credentials in una stringa JSON, 
      // che è il formato atteso dal server quando Content-Type è impostato su application/json.
      // credentials potrebbe essere un oggetto che contiene, per esempio, username e password.
      body: JSON.stringify(credentials),
    });
    if(response.ok) {
      const user = await response.json();
      return user;
    }
    else {
      const errDetails = await response.text();
      throw errDetails;
    }
};
  
const getUserInfo = async () => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    credentials: 'include',
  });
  const user = await response.json();
  if (response.ok) {
    return user;
  } else {
    throw user;  // an object with the error coming from the server
  }
};
  

const logOut = async() => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });
  if (response.ok)
    return null;
}

const fetchRoundData = async (excludedMemeIds) => {
  try {
    const response = await fetch(SERVER_URL + `/api/game/round?excludedMemeIds=${excludedMemeIds.join(',')}`);
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    console.log('hi');   //VIENE STAMPATO
    const data = await response.json();
    console.log('hei');   //NON VIENE STAMPATO
    return data;
  } catch (error) {
    console.error('Error fetching round data:', error);
    throw error;
  }
};
  

  const getMemes = async () => {
    const response = await fetch(SERVER_URL + '/api/game/memes');
    if(response.ok) {
      const memesJson = await response.json();
      return memesJson.map(m => new Meme(m.id, m.url));
    }
    else
      throw new Error('Internal server error');
  }

  const getMemePossible = async (excludedMemeIds) => {
    const response = await fetch(SERVER_URL + `/api/game/memepossible?excludedMemeIds=${excludedMemeIds.join(',')}`);
    if(response.ok) {
      const memesJson = await response.json();
      return memesJson.map(m => new Meme(m.id, m.url));
    }
    else
      throw new Error('Internal server error');
  }

  const getCaptions = async () => {
    const response = await fetch(SERVER_URL + '/api/game/captions');
    if(response.ok) {
      const captionsJson = await response.json();
      return captionsJson.map(c => new Caption(c.id, c.text, c.memeId));
    }
    else
      throw new Error('Internal server error');
  }

  const getCorrectCaptions = async (memeId) => {
    const response = await fetch(`${SERVER_URL}/api/game/memes/${memeId}/correctcaptions`);
    if(response.ok) {
      const correctcaptionsJson = await response.json();
      return correctcaptionsJson.map(ans => new Caption(ans.id, ans.text, and.memeId));
    }
    else
      throw new Error('Internal server error');
  }

  const getIncorrectCaptions = async (memeId) => {
    const response = await fetch(`${SERVER_URL}/api/game/memes/${memeId}/incorrectcaptions`);
    if(response.ok) {
      const incorrectcaptionsJson = await response.json();
      return incorrectcaptionsJson.map(ans => new Caption(ans.id, ans.text, ans.memeId));
    }
    else
      throw new Error('Internal server error');
  }

  const saveFinalScore = async (userId, score) =>{
    try {
      const response = await fetch(`${SERVER_URL}/api/game/saveScore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, score }),
      });

      if (!response.ok) {
        throw new Error('Failed to save score');
      }
    } catch (error) {
      console.error('Error saving score:', error);
    }
  }

  const getUserScores = async (userId) => {
    const response = await fetch(`${SERVER_URL}/api/scores/${userId}`);
    if (response.ok) {
      const scores = await response.json();
      return scores;
    } else {
      throw new Error('Failed to fetch user scores');
    }
  };

  const saveGameRounds = async (userId, score, rounds) => {
    const response = await fetch(`${SERVER_URL}/api/game/saveGameRounds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, score, rounds })
    });
  
    if (!response.ok) {
      throw new Error('Failed to save game rounds in API.mjs');
    }
  
    return await response.json();
  };


  const getUserRounds = async (userId) => {
    const response = await fetch(`${SERVER_URL}/api/rounds/${userId}`);
  
    if (!response.ok) {
      throw new Error('Failed to fetch user rounds');
    }
  
    return await response.json();
  };


  const API = {logIn, logOut, getUserInfo, fetchRoundData, getMemes, getMemePossible, 
    getCaptions, getCorrectCaptions, getIncorrectCaptions, saveFinalScore, 
    getUserScores, saveGameRounds, getUserRounds};
  export default API;