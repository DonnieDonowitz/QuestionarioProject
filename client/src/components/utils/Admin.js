import { Navbar, Button, Nav } from 'react-bootstrap';
import { LinkContainer} from 'react-router-bootstrap';

function Admin({ admin, loggedIn, logOut }) {
    return (
        <Navbar.Collapse className="justify-content-end text-light">
            { loggedIn && <Nav.Item className="d-inline-block mx-2 text-center pagination-centered welcomeMessage" > { `Welcome ${admin.username}!` } </Nav.Item> }
            { loggedIn ? <LinkContainer to="/"><Button variant="outline-light" onClick={logOut}> Logout </Button></LinkContainer> : <LinkContainer to="/login"><Button variant="outline-light"> Login </Button></LinkContainer> }
        </Navbar.Collapse>
    );
}

export default Admin;
