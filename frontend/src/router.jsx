import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import App from './App';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App activeTabProp="discover" />} />
        <Route path="/personalized" element={<App activeTabProp="personalized" />} />
        <Route path="/dashboard" element={<App activeTabProp="dashboard" />} />
        <Route path="/anime/:id" element={<App activeTabProp="discover" isDetailView={true} />} />
        {/* Catch all fallback */}
        <Route path="*" element={<App activeTabProp="discover" />} />
      </Routes>
    </BrowserRouter>
  );
}
