import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import LandingPage from './LandingPage/LandingPage';
import Register from './Register/Register';
import Login from './LogIn/LogIn';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard/Dashboard';
import CreatePost from './CreatePost/CreatePost';
import Task from './Dashboard/components/Task';
import Forum from './Dashboard/components/Forum';
import ForumPostDetail from './Dashboard/components/ForumPostDetail';
import Profile from './Dashboard/components/Profile';
import LeaderBoardEx from './LandingPage/components/LeaderBoardEx';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Task />} />
        <Route path="/dashboard/create-post" element={<CreatePost />} />
        <Route path="/dashboard/forum" element={<Forum />} />
        <Route
          path="/dashboard/forum-detail/:postId"
          element={<ForumPostDetail />}
        />
        <Route path="/dashboard/profile" element={<Profile />} />
        <Route path="/dashboard/leaderboard" element={<LeaderBoardEx />} />
      </Routes>
    </Router>
  </StrictMode>
);
