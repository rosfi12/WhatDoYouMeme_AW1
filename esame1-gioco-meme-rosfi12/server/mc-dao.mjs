import { Meme, Caption } from './MCModels.mjs';
import { db } from './db.mjs';

/** MEMES **/
// get all the memes
export const listMemes = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT meme.* FROM meme';
    db.all(sql, [], (err, rows) => {
      if (err)
        reject(err);
      else {
        const memes = rows.map((m) => new Meme(m.id, m.url));
        resolve(memes);
      }
    });
  });
}

export const getRandomMeme = (excludedMemeIds = []) => {
  return new Promise((resolve, reject) => {
  const placeholders = excludedMemeIds.map(() => '?').join(',');
  const query = `SELECT * FROM meme WHERE id NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT 1`;

  db.get(query, excludedMemeIds, (err, row) => {
      if (err) {
          console.error(err);  // Log the error
          reject(err);
      } else if (row) {
          const meme = new Meme(row.id, row.url);
          resolve(meme);
      } else {
          reject(new Error('No meme found'));
      }
  });
  });
}


/** CAPTIONS **/

// get all the captions
export const listCaptions = () => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT caption.* FROM caption';
      db.all(sql, [], (err, rows) => {
        if (err)
          reject(err);
        else {
          const captions = rows.map(c => new Caption(c.id, c.text, c.memeId));
          resolve(captions);
        }
      });
    });
  }

// get 2 correct captions of a given meme
export const listCorrectCaptionsOf = (memeId) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT caption.* FROM caption WHERE caption.memeId = ? ORDER BY RANDOM() LIMIT 2';
      db.all(sql, [memeId], (err, rows) => {
        if (err)
          reject(err)
        else {
          const captions = rows.map((ans) => new Caption(ans.id, ans.text, ans.memeId));
          resolve(captions);
        }
      });
    });
  }

// get all the correct captions of a given meme
export const listIncorrectCaptionsOf = (memeId) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT caption.* FROM caption WHERE caption.memeId != ?';
      db.all(sql, [memeId], (err, rows) => {
        if (err)
          reject(err)
        else {
          const captions = rows.map((ans) => new Caption(ans.id, ans.text, ans.memeId));
          resolve(captions);
        }
      });
    });
  }

  export const getRandomCaptions = (count, excludeCaptionsId = [], excludeCaptions = [], memeId) => {
    return new Promise((resolve, reject) => {
      // Creazione dei placeholder per le exclusion lists
      const placeholdersId = excludeCaptionsId.map(() => '?').join(',');
      const placeholdersCap = excludeCaptions.map(() => '?').join(',');
  
      // Seleziono le caption errate per quel meme quindi devo escludere l'id delle caption giuste per il meme e sapendo che
      // una caption può essere legata a più meme, non devo prendere nemmeno una caption con id diverso ma testo uguale
      // e infine tra le caption rimaste può capitare che vengano estratte 2 che non appartenenvano a quel meme ma che hanno testo
      // uguale e quindi ne devo tenere solo una delle due 
      const query = `
        SELECT * FROM caption LEFT JOIN (
          SELECT MIN(id) AS min_id
          FROM caption
          WHERE memeId != ?
          ${placeholdersId.length ? `AND id NOT IN (${placeholdersId})` : ''}
          ${placeholdersCap.length ? `AND text NOT IN (${placeholdersCap})` : ''}
          GROUP BY text
        ) AS subquery ON caption.id = subquery.min_id
        WHERE caption.memeId != ?
          ${placeholdersId.length ? `AND caption.id NOT IN (${placeholdersId})` : ''}
          ${placeholdersCap.length ? `AND caption.text NOT IN (${placeholdersCap})` : ''}
        ORDER BY RANDOM()
        LIMIT ?`;
  
      // Parametri per la query
      const params = [memeId, ...excludeCaptionsId, ...excludeCaptions, memeId, ...excludeCaptionsId, ...excludeCaptions, count];
  
      // Esecuzione della query
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  };
  
  
  
/** GAME **/
export const saveScore = (userId, score) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO scores (userId, score, createdAt, updatedAt) 
      VALUES (?, ?, datetime('now'), datetime('now'))`;
    const params = [userId, score];

    db.run(query, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID });
      }
    });
  });
};

export const getUserScores = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT score, createdAt FROM scores WHERE userId = ? 
      ORDER BY createdAt DESC`;
    const params = [userId];
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
        console.error(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const saveGameRounds = (userId, rounds) => {
  return new Promise((resolve, reject) => {
    for (const round of rounds) {
      const query = `
        INSERT INTO rounds (userId, memeId, memeUrl, isCorrect, createdAt) 
        VALUES (?, ?, ?, ?, datetime('now'))`;
      const params = [userId, round.meme.id, round.meme.url, round.isCorrect];

      db.run(query, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
    }
    });
};

export const getUserRounds = (userId) => {
  return new Promise((resolve, reject) => {
    const query =
      `SELECT rounds.*, meme.url as memeUrl 
       FROM rounds 
       JOIN meme ON rounds.memeId = meme.id 
       WHERE rounds.userId = ?
       ORDER BY rounds.createdAt DESC`;
    const params = [userId];
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
        console.error(err);
      } else {
        resolve(rows);
      }
    });
  });
};