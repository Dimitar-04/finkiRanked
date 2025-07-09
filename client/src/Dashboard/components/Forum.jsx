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
      console.log("Post deleted successfully");

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
  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  return (
    <div data-theme="luxury" className="min-h-screen bg-base-100">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6  sm:p-6 sm:pl-12 w-full">
        <div className="flex-1 order-2 lg:order-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 lg:mb-10">
            Forum Posts
          </h1>

          {loading ? (
            <div className="flex justify-center items-center h-32 sm:h-48 lg:h-64">
              <span className="loading loading-spinner loading-md sm:loading-lg"></span>
            </div>
          ) : (
            <>
              <div className="space-y-3 sm:space-y-4 pb-6 sm:pb-8">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-3 sm:p-4 lg:p-6 border rounded-lg shadow-sm hover:shadow-md transition relative bg-base-200"
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
                      <h2
                        className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold mb-2 cursor-pointer hover:underline line-clamp-2"
                        onClick={() => {
                          console.log("Post clicked:", post);
                          navigate(`/dashboard/forum-detail/${post.id}`, {
                            state: { post },
                          });
                        }}
                      >
                        {post.title}
                      </h2>
                    </div>

                    <p className="text-xs sm:text-sm lg:text-base text-gray-500 mb-2">
                      By {post.author_name},{" "}
                      <span>{post.date_created?.split("T")[0]}</span>
                    </p>
                    <p className="mt-2 text-gray-400 text-sm sm:text-base lg:text-lg xl:text-xl line-clamp-3 sm:line-clamp-none">
                      {post.content && post.content.length > 300
                        ? post.content.slice(0, 300) + "..."
                        : post.content}
                    </p>
                    <div
                      className="mt-3 sm:mt-4 flex justify-end items-center gap-2 cursor-pointer"
                      onClick={(e) => {
                        navigate(`/dashboard/forum-detail/${post.id}`, {
                          state: { post },
                        });
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
              {hasMore && (
                <div className="flex justify-center mt-4 sm:mt-6">
                  <button
                    onClick={handleLoadMore}
                    className={`btn btn-outline mb-4 sm:mb-6 ${
                      loadingMore ? "btn-disabled" : ""
                    }`}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <span className="loading loading-spinner loading-sm mr-2"></span>
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="w-full lg:w-1/4 order-1 lg:order-2">
          <div className="flex flex-row justify-center lg:justify-end p-4 sm:p-6 rounded-lg shadow-md bg-base-100">
            <button
              onClick={() => {
                navigate("/dashboard/create-post");
              }}
              className="cursor-pointer px-4 py-2 sm:px-6 sm:py-3 bg-yellow-500 text-black rounded hover:bg-yellow-600 text-sm sm:text-base font-medium w-full sm:w-auto"
            >
              Create a Post
            </button>
          </div>
        </div>
      </div>

      {/* Modal element */}
      {modal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
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
