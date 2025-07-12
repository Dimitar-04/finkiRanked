import React, { use, useState } from "react";
import pp from "../../assets/images/pp.svg";
import Navbar from "./Navbar";
import RankBadgeNav from "@/utils/RankBadgeForNavbar";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getPendingPosts } from "@/services/reviewService";
const Profile = () => {
  const { user, loading, logout } = useAuth();
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const navigate = useNavigate();

  const handleSignOut = async () => {
    navigate("/logout");
  };
  useEffect(() => {
    if (user) {
      const fetchPendingPosts = async () => {
        try {
          const data = await getPendingPosts();

          setPendingPosts(data);
        } catch (error) {
          console.error("Error fetching pending posts:", error);
        } finally {
          setLoadingPosts(false);
        }
      };
      fetchPendingPosts();
    }
  }, []);

  return (
    <div
      data-theme="luxury"
      className="dashboard h-screen flex bg-base-100 overflow-none"
    >
      <div
        data-theme="luxury"
        className="w-full flex flex-col items-center p-6 bg-base-200"
      >
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            {loading ? (
              <span className="loading loading-spinner loading-lg"></span>
            ) : (
              <>
                <div className="avatar">
                  <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img src={pp} alt="Profile" />
                  </div>
                </div>
                <h2 className="card-title mt-4">{user.name}</h2>
                <p className="text-gray-500">{user.email}</p>
                <div className="mt-4">
                  <div className="text-lg">
                    <RankBadgeNav rankName={user.rank} size="lg" />
                  </div>
                  <p className="text-lg mt-5">
                    <span className="font-bold">Total Points:</span>{" "}
                    {user.points}
                  </p>
                  <p className="text-lg mt-5">
                    <span className="font-bold">Solved Challenges:</span>{" "}
                    {user.solved_problems}
                  </p>
                </div>
                <div className="w-full mt-6">
                  <h3 className="text-xl font-bold">Posts Awaiting Approval</h3>
                  {loadingPosts ? (
                    <span className="loading loading-spinner loading-md mt-2"></span>
                  ) : pendingPosts.length > 0 ? (
                    <ul className="mt-2 text-left list-disc list-inside bg-base-200 p-4 rounded-lg">
                      {pendingPosts.map((post) => (
                        <li key={post.id}>{post.title}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-gray-500">
                      You have no posts waiting for review.
                    </p>
                  )}
                </div>
                <div className="mt-6">
                  <a
                    onClick={handleSignOut}
                    className="btn btn-action btn-sm mx-2"
                  >
                    Sign Out
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
