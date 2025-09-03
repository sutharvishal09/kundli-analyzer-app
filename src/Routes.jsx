import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import KundliAnalyzer from './pages/KundliAnalyzer';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/kundli-analyzer" element={<KundliAnalyzer />} />
        </Routes>
    );
};

export default AppRoutes;
