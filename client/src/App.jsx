import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import LandingPage from "./LandingPage/LandingPage";
import Register from "./Register/Register";
import Login from "./LogIn/LogIn";
import CreatePost from "./CreatePost/CreatePost";
import Task from "./Dashboard/components/Task";
import Forum from "./Dashboard/components/Forum";
import ForumPostDetail from "./Dashboard/components/ForumPostDetail";
import Profile from "./Dashboard/components/Profile";
import LeaderBoardEx from "./LandingPage/components/LeaderBoardEx";
import ManagePosts from "@/Dashboard/components/ManagePosts.jsx";
import DashboardLayout from "./Dashboard/DashboardLayout";
import Logout from "./Dashboard/components/Logout";
import ManageChallenges from "./Dashboard/components/ManageChallenges";
import CreateNewChallenge from "./Dashboard/components/CreateNewChallenge";
// import { ForumSearchParamsProvider } from "./contexts/ForumSearchParamsContext";

import UserPosts from "./Dashboard/components/userPosts";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />

      {/* Protected Routes */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Task />} />
        <Route path="create-post" element={<CreatePost />} />
        <Route path="forum" element={<Forum />} />
        <Route path="manage-posts" element={<ManagePosts />} />
        <Route path="forum-detail/:postId" element={<ForumPostDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="leaderboard" element={<LeaderBoardEx />} />
        <Route path="manage-challenges" element={<ManageChallenges />} />
        <Route path="create-new-challenge" element={<CreateNewChallenge />} />
        <Route path="user-posts" element={<UserPosts />} />
      </Route>
    </Routes>
  );
}
