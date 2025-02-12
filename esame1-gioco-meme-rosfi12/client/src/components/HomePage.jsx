import React from 'react';
import { Container, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Style.css'; 

function HomePage(props) {
  return (
    <div className="home-container">
      <Container fluid className="p-0">
        <Card className="bg-dark text-white" style={{ height: "100vh", overflow: "hidden" }}>
          <Card.Img src="http://localhost:3001/sfondo.png" alt="Sfondo" />
          <Card.ImgOverlay className="d-flex flex-column justify-content-center align-items-center">
            {props.loggedIn ?
              <div className="d-flex flex-column align-items-center">
                <Button variant="primary" as={Link} to="/game" className="mb-3 btn-lg custom-anonimo-btn">
                  Nuova partita
                </Button>
              </div>
              :
              <div className="d-flex flex-column align-items-center">
                <Button variant="primary" as={Link} to="/game" className="mb-3 btn-lg custom-anonimo-btn">
                  Gioca in anonimo
                </Button>
                <Button variant="secondary" as={Link} to="/login" className="btn-lg custom-login-btn">
                  Login
                </Button>
              </div>
            }
          </Card.ImgOverlay>
        </Card>
      </Container>
    </div>
  );
}

export default HomePage;
