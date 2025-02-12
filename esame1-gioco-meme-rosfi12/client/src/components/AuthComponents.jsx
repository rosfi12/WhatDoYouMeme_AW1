import { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import './Style.css';

function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (event) => {
      event.preventDefault();
      
      const credentials = { username, password };
      
      props.login(credentials);
  };

  return (
    <div className="centered-container">
      <Container className="form-container">
        <h2 className="form-title">Login</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formUsername">
            <Form.Label className='form-text'>Username</Form.Label>
            <Form.Control
              className="form-control-custom"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={ev => setUsername(ev.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="formPassword" className="mt-3">
            <Form.Label className='form-text'>Password</Form.Label>
            <Form.Control
              className="form-control-custom"
              type="password"
              placeholder="Password"
              value={password}
              onChange={ev => setPassword(ev.target.value)}
              required
              minLength={4}
            />
          </Form.Group>

          <Button className="btn-custom" type="submit" variant="primary">Login</Button>
          <Link className="btn btn-danger btn-cancel" to={'/'}>Cancel</Link>
        </Form>
      </Container>
    </div>
  );
};

function LogoutButton(props) {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    props.logout();
    navigate('/');
  };

  return(
    <Button className='logout-button' variant='outline-light' onClick={handleLogout}>Logout</Button>
  )
}

export { LoginForm, LogoutButton };

