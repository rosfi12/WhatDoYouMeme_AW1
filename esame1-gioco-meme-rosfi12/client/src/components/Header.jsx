import React from 'react';
import { Navbar, Nav, Container, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LogoutButton } from './AuthComponents';

function Header(props) {

  return (
    <Navbar className='navbar' >
      <Container>
        <Navbar.Brand className='navbar-brand' as={Link} to={{ pathname: "/", state: { loggedIn: props.loggedIn } }}>WdyM?</Navbar.Brand>
        <Nav className="navbar me-auto">
        </Nav>
        <Nav>
          {props.loggedIn ? (
            <>
              <Nav.Link as={Link} to="/profile">
              <Image src="http://localhost:3001/profilo.jpg" roundedCircle fluid className='navbar-img' />
              </Nav.Link>
              <LogoutButton logout={props.handleLogout} />
            </>
          ) : (
            <Nav.Link className='login-scritta' as={Link} to="/login">Login</Nav.Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;
