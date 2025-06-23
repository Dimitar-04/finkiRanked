import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import ProtectedRoute from "./routes/ProtectedRoute";
import LandingPage from "./LandingPage/LandingPage";
import Register from "./Register/Register";
import Login from "./LogIn/LogIn";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreatePost from "./CreatePost/CreatePost";
import Task from "./Dashboard/components/Task";
import Forum from "./Dashboard/components/Forum";
import ForumPostDetail from "./Dashboard/components/ForumPostDetail";
import Profile from "./Dashboard/components/Profile";
import LeaderBoardEx from "./LandingPage/components/LeaderBoardEx";
import ManagePosts from "@/Dashboard/components/ManagePosts.jsx";
import { AuthProvider } from "./contexts/AuthContext";

createRoot(document.getElementById("root")).render(
  <Router>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Task />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/create-post"
          element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/forum"
          element={
            <ProtectedRoute>
              <Forum />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/manage-posts"
          element={
            <ProtectedRoute>
              <ManagePosts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/forum-detail/:postId"
          element={
            <ProtectedRoute>
              <ForumPostDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/leaderboard"
          element={
            <ProtectedRoute>
              <LeaderBoardEx />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  </Router>
);
