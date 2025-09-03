// src/components/Login.jsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Form, Button, Alert } from 'react-bootstrap';
import { auth } from '../firebase';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            onLogin(); // 🔓 Call parent login function
        } catch (err) {
            console.error(err);
            setError('Invalid email or password');
        }
    };

    return (
        <div
            style={{
                backgroundImage: `linear-gradient(to right top, rgba(255, 230, 236, 0.6), rgba(224, 247, 250, 0.6)), url('/bg-login.jpg')`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px',
            }}
        >
            <div
                style={{
                    background: '#ffffffcc',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '30px',
                    width: '100%',
                    maxWidth: '360px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                }}
            >
                <img src="/Ganeshji_Logo.png" alt="Ganesh Logo" style={{ width: 200, display: 'block', margin: '0 auto 20px' }} />
                <h2 style={{ textAlign: 'center', color: '#b11266', marginBottom: '30px' }}>Gopigeet Yuvak Mandal</h2>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="email" className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="password" className="mb-4">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100">
                        Login
                    </Button>
                </Form>
            </div>
        </div>
    );
};

export default Login;
