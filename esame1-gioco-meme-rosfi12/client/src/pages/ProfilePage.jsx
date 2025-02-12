import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Image } from 'react-bootstrap';
import API from '../API.mjs';

function ProfilePage({ user }) {
  const [rounds, setRounds] = useState([]);

  useEffect(() => {
    const fetchRounds = async () => {
      try {
        const userRounds = await API.getUserRounds(user.id);
        setRounds(userRounds);
      } catch (err) {
        console.error('Failed to fetch user rounds', err);
      }
    };

    fetchRounds();
  }, [user.id]);

  // Calcola il punteggio totale per ogni partita
  const calculateScores = (rounds) => {
    const scores = {};

    rounds.forEach((round) => {
      //uso gameKey prendendo dal database il dato corrispondente a creadedAt 
      //che contiene la data e l'ora in cui ho salvato i dati del round in modo 
      //da avere una chiave univoca per distinguere le varie partite che ho fatto
      //Non bastava separarle per giorno perchè s ein un giorno avevo fatto più partite
      //non le separava
      const gameKey = `${new Date(round.createdAt).toLocaleString()}`;
      if (!scores[gameKey]) {
        scores[gameKey] = {
          gameId: round.gameId,
          date: new Date(round.createdAt).toLocaleDateString(),
          score: 0,
          rounds: [],
        };
      }

      const isCorrect = round.isCorrect;
      const points = isCorrect ? 5 : 0;
      scores[gameKey].score += points;
      scores[gameKey].rounds.push({
        memeUrl: round.memeUrl,
        points: points,
        isCorrect: isCorrect,
      });
    });

    // Restituisco i punteggi come array
    return Object.values(scores);
  };

  const scores = calculateScores(rounds);

  return (
    <Container className="profile-page-container p-4">
      <Row>
        <Col md={4} className="text-center">
          <Image src="http://localhost:3001/profilo.jpg" roundedCircle fluid className='img' />
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </Col>
        <Col md={8}>
          <h3>Punteggi ottenuti</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Data</th>
                <th>Punteggio totale</th>
                <th>Dettagli</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score, index) => (
                <tr key={index}>
                  <td>{score.date}</td>
                  <td>{score.score}</td>
                  <td>
                    {score.rounds.map((round, roundIndex) => (
                      <div key={roundIndex} className="mb-3">
                        <Image src={`http://localhost:3001/${round.memeUrl}`} alt="Meme" className="img-fluid mb-2" style={{ maxWidth: '50px', marginRight: '10px' }} />
                        <span>{round.isCorrect ? 'Corretta' : 'Sbagliata'} - Punti: {round.points}</span>
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default ProfilePage;
