import React from 'react';
import { Container, Row, Col, Card, Image, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../components/Style.css';

function SummaryPage(props) {
  // deserializzazione di props
  const { scoreTot, rounds } = props;
  const navigate = useNavigate();

  const handleGame = () => {
    navigate('/game'); 
  };

  return (
    <Container className='summary-container'>
      <Row>
        <Col><h1 className='round-scritta'>Meme indovinati</h1></Col>
        <Col className="text-center">
        <Button onClick={handleGame} className="button-newGame-summary" variant='outline-light'>Gioca di nuovo</Button>
        </Col>
        <Col><h2 className='round-scritta text-end'>Punteggio totale: {scoreTot}</h2></Col>
      </Row>
      
      <Row>
        {rounds.length > 0 ? (
          rounds.map((round, index) => (
            <Col md={4} key={index}>
              <Card>
                <Card.Img className='img-summary' variant="top" src={`http://localhost:3001/${round.meme.url}`} alt={`Meme ${index + 1}`} />
                <Card.Body>
                  <Card.Title className='round-scritta'>Meme {index + 1}</Card.Title>
                  <Card.Text>
                    Le captions corrette erano:
                    <ul>
                      {round.correctCaptions.map((caption, idx) => (
                        <li key={idx}>{caption.text}</li>
                      ))}
                    </ul>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col className="text-center">
            <Image src={`http://localhost:3001/no.jpg`} roundedCircle className='img-summary' />
            <h3 className='round-scritta'>Non hai indovinato niente!</h3>
          </Col>
        )}
      </Row>
    </Container>
  );
}

export default SummaryPage;
