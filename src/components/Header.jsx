import React from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Header = ({ onLogout }) => {
    return (
        <Navbar bg="light" expand="lg" className="shadow-sm py-3 mb-4">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    Gopigeet Yuvak Mandal
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="main-navbar-nav" />
                <Navbar.Collapse id="main-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
                        <Nav.Link as={Link} to="/analyzer">Kundli Analyzer</Nav.Link>
                    </Nav>
                    <Button variant="outline-danger" onClick={onLogout}>
                        Logout
                    </Button>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;

