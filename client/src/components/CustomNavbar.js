import { Navbar, Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Admin from './utils/Admin.js';
 
function CustomNavbar(props) {
    return (
        <Navbar collapseOnSelect className="navBar">
            <Navbar.Brand href="#" className="navBarBrand"> 
                <img src="/logo.png" width="40px" height="40px" className="m-1 d-inline-block align-text-center" alt='logo'/>    
                SURVEYS4ALL 
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />

            <Navbar.Collapse className="justify-content-center">
                <Nav> 
                    { props.loggedIn && <LinkContainer to="/newsurvey"  className="linkNav" activeClassName="linkNavActive"><Nav.Link> NEW SURVEY </Nav.Link></LinkContainer>}     
                    <LinkContainer to="/"  className="linkNav" activeClassName="linkNavActive"><Nav.Link> SURVEYS </Nav.Link></LinkContainer>
                </Nav>
            </Navbar.Collapse>
            <Admin admin={props.admin} loggedIn={props.loggedIn} logOut={props.logout} />        
        </Navbar>
    );
}

export default CustomNavbar;

