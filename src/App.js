import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import KundliAnalyzer from './pages/KundliAnalyzer';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  if (!isLoggedIn) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  return (
    <Router>
      <Header onLogout={handleLogout} />
      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analyzer" element={<KundliAnalyzer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
