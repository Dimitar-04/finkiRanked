import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import commentIcon from "../../assets/images/comment.svg";
import trashIcon from "../../assets/images/delete.svg"; // Add this import
import Navbar from "./Navbar";
import { getForumPosts, deleteForumPost } from "@/services/forumService";
import { useAuth } from "@/contexts/AuthContext";

const Forum = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    type: "",
    postId: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const postsPerPage = 5;
  const { user } = useAuth();
  console.log(user);

  const showModal = (message, type = "info", postId = null) => {
    setModal({ isOpen: true, message, type, postId });
  };

  const closeModal = () => {
    setModal({ isOpen: false, message: "", type: "", postId: null });
  };

  const confirmDelete = async () => {
    if (modal.postId) {
      setIsDeleting(true);
      await handleDeletePost(modal.postId);
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    try {
      if (page === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const data = await getForumPosts(page, postsPerPage);
      console.log(data);

      if (page === 0) {
        setPosts(data);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...data]);
      }
      if (data.length < postsPerPage) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching forum posts:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteForumPost(postId);

      setLoading(true);
      const data = await getForumPosts(0, postsPerPage);
      setPosts(data);
      setPage(0);
      setHasMore(data.length >= postsPerPage);
      showModal("Post deleted successfully.", "success");
      setLoading(false);
    } catch (error) {
      console.error("Error deleting post:", error);

      setLoading(false);
    }
  };

  return (
    <div data-theme="luxury" className="min-h-screen bg-base-100">
      <div className="flex flex-col h-screen">
        {/* Sticky Header Section */}
        <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 shadow-sm">
          <div className="p-4 sm:p-6 sm:pl-12 w-full">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center lg:text-left">
                Forum Posts
              </h1>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 w-full lg:w-auto">
                <button
                  onClick={() => {
                    navigate("/dashboard/create-post");
                  }}
                  className="cursor-pointer px-4 py-2 sm:px-6 sm:py-3 bg-yellow-500 text-black rounded hover:bg-yellow-600 text-sm sm:text-base font-medium w-full lg:w-auto lg:whitespace-nowrap"
                >
                  Create a Post
                </button>
                <button
                  onClick={() => {
                    navigate("/dashboard/user-posts");
                  }}
                  className="cursor-pointer px-4 py-2 sm:px-6 sm:py-3 bg-yellow-500 text-black rounded hover:bg-yellow-600 text-sm sm:text-base font-medium w-full lg:w-auto lg:whitespace-nowrap"
                >
                  Your posts
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 ">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <span className="loading loading-spinner loading-md sm:loading-lg"></span>
            </div>
          ) : (
            <div className="h-full">
              {/* Sticky Column Headers */}
              <div className="sticky top-0 z-10 bg-base-100  border-base-300 shadow-sm">
                <div className="p-4 sm:p-6 sm:pl-12 w-full">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                    {/* General Programming Header */}
                    <div
                      className="cursor-pointer  group border rounded-lg"
                      onClick={() => navigate("/dashboard/forum/general")}
                    >
                      <div className="flex items-center gap-3 p-3 sm:p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
                        <div className="flex-1 ">
                          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold transition-colors mb-2 ">
                            General Programming Discussions
                          </h2>
                          <p className="text-sm text-gray-500">
                            Click to view all discussions on "General
                            Programming"
                          </p>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 text-gray-400 group-hover:text-yellow-400 transition-colors"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Daily Challenge Header */}
                    <div
                      className="cursor-pointer group border rounded-lg"
                      onClick={() =>
                        navigate("/dashboard/forum/daily-challenge")
                      }
                    >
                      <div className="flex items-center gap-3 p-3 sm:p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
                        <div className="flex-1">
                          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold transition-colors mb-2">
                            Daily Challenge Discussions
                          </h2>
                          <p className="text-sm text-gray-500">
                            Click to view all discussions on "Daily Challenge"
                          </p>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 text-gray-400 group-hover:text-yellow-400 transition-colors"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Posts Content */}
              <div className=" overflow-y-auto">
                <div className="p-4 sm:p-6 sm:pl-12 w-full">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 items-start">
                    {/* General Programming Column */}
                    <div className="flex flex-col ">
                      <div className="grid grid-cols-1 gap-4 sm:gap-6">
                        {posts
                          .filter((post) => post.topic === "general")
                          .map((post) => (
                            <div
                              key={post.id}
                              className="p-3 sm:p-4 lg:p-6  rounded-lg shadow-sm hover:shadow-md transition relative bg-base-200 h-full flex flex-col"
                            >
                              {(post.author_name === user.name ||
                                post.author_name === user.username ||
                                user.isModerator) && (
                                <button
                                  className="absolute top-2 right-2 p-1.5 cursor-pointer rounded-full hover:bg-gray-600 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    showModal(
                                      "Are you sure you want to delete this post? This action cannot be undone.",
                                      "confirm",
                                      post.id
                                    );
                                  }}
                                >
                                  <img
                                    src={trashIcon}
                                    alt="Delete"
                                    className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                                  />
                                </button>
                              )}

                              <div className="flex items-center gap-2 sm:gap-4 mt-2 pr-8 sm:pr-10">
                                <h3
                                  className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 cursor-pointer hover:underline line-clamp-2 text-center sm:text-left w-full"
                                  onClick={() => {
                                    navigate(
                                      `/dashboard/forum-detail/${post.id}`,
                                      {
                                        state: { post },
                                      }
                                    );
                                  }}
                                >
                                  {post.title}
                                </h3>
                              </div>

                              <p className="text-xs sm:text-sm text-gray-500 mb-2 flex flex-col sm:flex-row items-center sm:justify-start gap-0 sm:gap-2">
                                <span>
                                  By{" "}
                                  <span className="font-semibold underline">
                                    {post.author_name}
                                  </span>
                                </span>
                                <span className="hidden sm:inline mx-1 text-gray-400">
                                  •
                                </span>
                                <span className="italic text-gray-400">
                                  {new Date(
                                    post.date_created
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </p>
                              <p className="mt-2 text-gray-400 text-sm sm:text-base line-clamp-3 text-center sm:text-left flex-grow">
                                {post.content && post.content.length > 100
                                  ? post.content.slice(0, 70) + "..."
                                  : post.content}
                              </p>
                              <div
                                className="mt-3 sm:mt-4 flex justify-center sm:justify-end items-center gap-2 cursor-pointer"
                                onClick={(e) => {
                                  navigate(
                                    `/dashboard/forum-detail/${post.id}`,
                                    {
                                      state: { post },
                                    }
                                  );
                                }}
                              >
                                <p className="text-sm sm:text-base">
                                  {post.comment_count}
                                </p>
                                <img
                                  src={commentIcon}
                                  alt="Comment"
                                  className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 hover:opacity-80"
                                />
                              </div>
                            </div>
                          ))}
                      </div>

                      {posts.filter((post) => post.topic === "general").length >
                        6 && (
                        <div className="flex justify-center mt-4 sm:mt-6">
                          <button
                            onClick={() => navigate("/dashboard/forum/general")}
                            className="btn btn-outline"
                          >
                            View All General Posts
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Daily Challenge Column */}
                    <div className="flex flex-col ">
                      <div className="grid grid-cols-1 gap-4 sm:gap-6 ">
                        {posts
                          .filter((post) => post.topic === "daily-challenge")
                          .map((post) => (
                            <div
                              key={post.id}
                              className="p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm hover:shadow-md transition relative bg-base-200 h-full flex flex-col"
                            >
                              {(post.author_name === user.name ||
                                post.author_name === user.username ||
                                user.isModerator) && (
                                <button
                                  className="absolute top-2 right-2 p-1.5 cursor-pointer rounded-full hover:bg-gray-600 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    showModal(
                                      "Are you sure you want to delete this post? This action cannot be undone.",
                                      "confirm",
                                      post.id
                                    );
                                  }}
                                >
                                  <img
                                    src={trashIcon}
                                    alt="Delete"
                                    className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                                  />
                                </button>
                              )}

                              <div className="flex items-center gap-2 sm:gap-4 mt-2 pr-8 sm:pr-10">
                                <h3
                                  className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 cursor-pointer hover:underline line-clamp-2 text-center sm:text-left w-full"
                                  onClick={() => {
                                    navigate(
                                      `/dashboard/forum-detail/${post.id}`,
                                      {
                                        state: { post },
                                      }
                                    );
                                  }}
                                >
                                  {post.title}
                                </h3>
                              </div>

                              {/* Challenge Title Badge */}

                              <p className="text-xs sm:text-sm text-gray-500 mb-2 flex flex-col sm:flex-row items-center sm:justify-start gap-0 sm:gap-2">
                                <span>
                                  By{" "}
                                  <span className="font-semibold underline">
                                    {post.author_name}
                                  </span>
                                </span>
                                <span className="hidden sm:inline mx-1 text-gray-400">
                                  •
                                </span>
                                <span className="italic text-gray-400">
                                  {new Date(
                                    post.date_created
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>{" "}
                                {/* Left: Challenge Title Badge */}
                                {post.challengeTitle ? (
                                  <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-1 py-1 rounded">
                                    {post.challengeTitle}
                                  </span>
                                ) : (
                                  <span /> // keeps spacing if no badge
                                )}
                              </p>
                              <p className="mt-2 text-gray-400 text-sm sm:text-base line-clamp-3 text-center sm:text-left flex-grow">
                                {post.content && post.content.length > 100
                                  ? post.content.slice(0, 100) + "..."
                                  : post.content}
                              </p>
                              <div className="mt-3 sm:mt-4 flex items-center justify-end gap-4">
                                {/* Right: Comment Count and Icon */}
                                <div
                                  className="flex items-center gap-2 cursor-pointer"
                                  onClick={(e) => {
                                    navigate(
                                      `/dashboard/forum-detail/${post.id}`,
                                      {
                                        state: { post },
                                      }
                                    );
                                  }}
                                >
                                  <p className="text-sm sm:text-base">
                                    {post.comment_count}
                                  </p>
                                  <img
                                    src={commentIcon}
                                    alt="Comment"
                                    className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 hover:opacity-80"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>

                      {posts.filter((post) => post.topic === "daily-challenge")
                        .length > 6 && (
                        <div className="flex justify-center mt-4 sm:mt-6">
                          <button
                            onClick={() =>
                              navigate("/dashboard/forum/daily-challenge")
                            }
                            className="btn btn-outline"
                          >
                            View All Challenge Posts
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal element */}
      {modal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50 backdrop-blur-sm p-4"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-base-200 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              {modal.type === "confirm" && (
                <div className="w-8 h-8 rounded-full bg-error flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-error-content"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                </div>
              )}
              {modal.type === "success" && (
                <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-success-content"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
              )}
              <h3 className="font-bold text-base sm:text-lg" id="modal-title">
                Delete Post
              </h3>
            </div>
            <p className="py-3 sm:py-4 text-sm sm:text-base">{modal.message}</p>
            <div className="flex justify-end gap-2 sm:gap-3 mt-3 sm:mt-4">
              {modal.type === "confirm" ? (
                <>
                  <button
                    className="btn btn-ghost btn-sm sm:btn-md"
                    onClick={closeModal}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-error btn-sm sm:btn-md"
                    onClick={confirmDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <span className="loading loading-spinner loading-sm mr-2"></span>
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-primary btn-sm sm:btn-md"
                  onClick={closeModal}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forum;
