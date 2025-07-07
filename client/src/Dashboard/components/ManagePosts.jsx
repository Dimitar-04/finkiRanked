import React, { useState, useEffect, useCallback } from "react";

import doneAll from "../../assets/images/done-all.svg";
import trashIcon from "../../assets/images/delete.svg";
import { useAuth } from "@/contexts/AuthContext";
import {
  getReviewPosts,
  deleteReviewPost,
  approveReviewPost,
} from "@/services/reviewService";

const ManagePosts = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const postsPerPage = 5;
  const { user, loading: authLoading } = useAuth();
  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    type: "",
    postId: null,
    post: null,
  });
  const [isActionLoading, setIsActionLoading] = useState(false);

  const showModal = (message, type, postId = null, post = null) => {
    setModal({ isOpen: true, message, type, postId, post });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      message: "",
      type: "",
      postId: null,
      post: null,
    });
  };

  const confirmAction = async () => {
    setIsActionLoading(true);
    if (modal.type === "delete" && modal.postId) {
      await handleDeletePost(modal.postId);
    } else if (modal.type === "approve" && modal.post) {
      await handleApprovePost(modal.post);
    }
    setIsActionLoading(false);
  };

  const fetchPostsData = useCallback(async () => {
    if (authLoading) return;

    if (!user || !user.id) {
      setError("User not found. Please log in.");
      return;
    }

    if (page === 0) {
      setIsFetching(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const data = await getReviewPosts(page, postsPerPage, user.id);
      setPosts((prevPosts) => (page === 0 ? data : [...prevPosts, ...data]));
      setHasMore(data.length === postsPerPage);
    } catch (err) {
      console.error("Error fetching review posts:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch posts for review."
      );
    } finally {
      setIsFetching(false);
      setLoadingMore(false);
    }
  }, [page, user, authLoading]);

  useEffect(() => {
    fetchPostsData();
  }, [fetchPostsData]);

  const handleDeletePost = async (postId) => {
    if (!user || !user.id) {
      console.error("User ID not found for delete operation");
      setError("Action cannot be performed without user authentication.");
      return;
    }
    try {
      await deleteReviewPost(postId, user.id);
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      showModal("Post deleted successfully.", "deleted");
    } catch (err) {
      console.error("Error deleting review post:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to delete post."
      );
    }
  };

  const handleApprovePost = async (postToApprove) => {
    if (!user || !user.id || !postToApprove) {
      console.error("User ID or post data not found for approve operation");
      setError("Action cannot be performed without user or post data.");
      return;
    }
    try {
      const postDataForApproval = {
        authorId: postToApprove.authorId,
        authorName: postToApprove.authorName,
        title: postToApprove.title,
        content: postToApprove.content,
      };

      await approveReviewPost(postToApprove.id, postDataForApproval, user.id);
      setPosts((prevPosts) =>
        prevPosts.filter((p) => p.id !== postToApprove.id)
      );
      showModal("Post approved successfully.", "success");
    } catch (err) {
      console.error("Error approving post:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to approve post."
      );
      showModal(
        err.response?.data?.message || err.message || "Failed to approve post.",
        "error"
      );
    }
  };

  const openConfirmationModal = (type, item, postTitle) => {
    if (type === "delete") {
      showModal(
        `Are you sure you want to delete post with title "${postTitle}"? This action cannot be undone.`,
        "delete",
        item
      );
    } else if (type === "approve") {
      showModal(
        `Are you sure you want to approve post with title "${postTitle}"? It will be published to the forum.`,
        "approve",
        item.id,
        item
      );
    }
  };

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const isLoading = authLoading || isFetching;

  return (
    <div
      data-theme="luxury"
      className="dashboard h-screen flex bg-base-100 overflow-none"
    >
      <div className="flex flex-col w-full h-full overflow-y-auto p-6">
        <div className="flex-1 md:ml-8">
          <h1 className="text-4xl font-bold mb-10">Posts to be reviewed:</h1>
          {error && (
            <div className="alert alert-error shadow-lg mb-4">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current flex-shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
                <button
                  className="btn btn-xs btn-ghost"
                  onClick={() => setError(null)}
                >
                  Clear
                </button>
              </div>
            </div>
          )}
          {isLoading && (
            <div className="flex justify-center mt-6">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          )}
          {posts.length === 0 && !isLoading && !loadingMore && !error && (
            <div className="text-center text-gray-500 py-10">
              No posts currently awaiting approval.
            </div>
          )}
          {!isLoading && (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-6 border border-base-300 bg-base-200 rounded-lg shadow-sm hover:shadow-md transition relative"
                >
                  <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      title="Approve Post"
                      className="btn btn-sm btn-success btn-circle"
                      onClick={(e) => {
                        e.stopPropagation();
                        openConfirmationModal("approve", post, post.title);
                      }}
                    >
                      <img src={doneAll} alt="Approve" className="w-5 h-5" />
                    </button>
                    <button
                      title="Delete Post"
                      className="btn btn-sm btn-error btn-circle"
                      onClick={(e) => {
                        e.stopPropagation();
                        openConfirmationModal("delete", post.id, post.title);
                      }}
                    >
                      <img src={trashIcon} alt="Delete" className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-sm text-base-content/70 mb-3">
                    By {post.author_name} on{" "}
                    <span>
                      {post.date_created
                        ? new Date(post.date_created).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </p>
                  <p className="text-base-content/90 whitespace-pre-line break-words">
                    {post.content}
                  </p>
                </div>
              ))}
            </div>
          )}
          {hasMore && !loadingMore && !isLoading && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleLoadMore}
                className="btn btn-primary"
                disabled={loadingMore}
              >
                Load More
              </button>
            </div>
          )}
          {loadingMore && (
            <div className="flex justify-center mt-6">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          )}
        </div>
      </div>

      {/* Modal element */}
      {modal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-base-200 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              {(modal.type === "approve" || modal.type === "success") && (
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
              {(modal.type === "delete" ||
                modal.type === "deleted" ||
                modal.type === "error") && (
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
              <h3 className="font-bold text-lg" id="modal-title">
                {modal.type === "approve" && "Approve Post"}
                {modal.type === "deleted" && "Delete Post"}
                {(modal.type === "success" || modal.type === "error") &&
                  "Approve Post"}
              </h3>
            </div>
            <p className="py-4">{modal.message}</p>
            <div className="flex justify-end gap-3 mt-4">
              {modal.type === "approve" || modal.type === "delete" ? (
                <>
                  <button
                    className="btn btn-ghost"
                    onClick={closeModal}
                    disabled={isActionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className={`btn ${
                      modal.type === "approve" ? "btn-success" : "btn-error"
                    }`}
                    onClick={confirmAction}
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm mr-2"></span>
                        {modal.type === "approve"
                          ? "Approving..."
                          : "Deleting..."}
                      </>
                    ) : modal.type === "approve" ? (
                      "Approve"
                    ) : (
                      "Delete"
                    )}
                  </button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={closeModal}>
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

export default ManagePosts;
