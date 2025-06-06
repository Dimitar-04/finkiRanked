import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import LandingPage from './LandingPage/LandingPage';
import Register from './Register/Register';
import Login from './LogIn/LogIn';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard/Dashboard';
import CreatePost from './CreatePost/CreatePost';
import Forum from './Dashboard/components/Forum';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/forum" element={<Forum />} />
      </Routes>
    </Router>
  </StrictMode>
);
