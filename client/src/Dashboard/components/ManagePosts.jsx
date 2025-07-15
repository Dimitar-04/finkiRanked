import React, { useState, useEffect, useCallback, useRef } from "react";

import doneAll from "../../assets/images/done-all.svg";
import trashIcon from "../../assets/images/delete.svg";
import { useAuth } from "@/contexts/AuthContext";
import {
  getReviewPosts,
  deleteReviewPost,
  approveReviewPost,
} from "@/services/reviewService";
import { DatePicker } from "react-daisyui-timetools";
import "react-datepicker/dist/react-datepicker.css";
import "cally";
const ManagePosts = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

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
    if (authLoading || !user?.id) return;

    setIsFetching(true);
    setError(null);
    const pageToFetch = page - 1;
    try {
      const data = await getReviewPosts(
        pageToFetch,
        postsPerPage,
        user.id,
        searchQuery,
        selectedDate
      );

      setPosts(data.posts);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Error fetching review posts:", err);
      setPosts([]);
      setTotalPages(0);
      setError(
        err.response?.data?.error ||
          "Failed to fetch posts. You may not have permission."
      );
    } finally {
      setIsFetching(false);
    }
  }, [user?.id, searchQuery, selectedDate, page]);

  useEffect(() => {
    setPage(1);
  }, [submittedQuery, selectedDate]);
  useEffect(() => {
    fetchPostsData();
  }, [submittedQuery, selectedDate, user?.id]);

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setSubmittedQuery(searchQuery);
    }
  };
  useEffect(() => {
    if (page > 0) {
      fetchPostsData(false);
    }
  }, [page]);

  const handleDeletePost = async (postId) => {
    try {
      console.log(postId.id);
      await deleteReviewPost(postId, user.id);
      fetchPostsData();
      showModal("Post deleted successfully.", "deleted");
    } catch (err) {
      console.error("Error deleting review post:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to delete post."
      );
    }
  };

  const handleApprovePost = async (postToApprove) => {
    try {
      const postDataForApproval = {
        authorId: postToApprove.authorId,
        authorName: postToApprove.authorName,
        title: postToApprove.title,
        content: postToApprove.content,
      };

      await approveReviewPost(postToApprove.id, postDataForApproval, user.id);
      fetchPostsData();
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

  const openConfirmationModal = (type, item) => {
    if (type === "delete") {
      showModal(
        `Are you sure you want to delete post with title "${item.title}"? This action cannot be undone.`,
        "delete",
        item.id,
        item
      );
    } else if (type === "approve") {
      showModal(
        `Are you sure you want to approve post with title "${item.title}"? It will be published to the forum.`,
        "approve",
        item.id,
        item
      );
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const isLoading = authLoading || isFetching;

  return (
    <div
      data-theme="luxury"
      className="dashboard min-h-screen flex bg-base-100"
    >
      <div className="flex flex-col w-full h-full overflow-y-auto p-4 sm:p-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 lg:mb-10 text-center lg:text-left">
            Posts to be reviewed:
          </h1>
          {/* Search and Filter Bar */}
          <div className="mb-6 sm:mb-8 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            <div className="relative w-full lg:w-2/5">
              <input
                type="text"
                placeholder="Search by title..."
                className="input input-bordered w-full pl-10 text-sm sm:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 z-10 absolute top-1/2 left-3 transform -translate-y-1/2 text-base-content/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <DatePicker
                className="p-2 w-full sm:w-auto min-w-0"
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                placeholder="Search by date"
              />
              {selectedDate && (
                <button
                  className="btn btn-sm text-red-500 cursor-pointer w-full sm:w-auto"
                  onClick={() => setSelectedDate(null)}
                >
                  Clear date
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="alert alert-error shadow-lg mb-4 mx-auto max-w-4xl">
              <span className="text-sm sm:text-base">{error}</span>
            </div>
          )}
          {isLoading && (
            <div className="flex justify-center mt-6">
              <span className="loading loading-spinner loading-md sm:loading-lg"></span>
            </div>
          )}
          {posts.length === 0 && !isLoading && !error && (
            <div className="text-center text-gray-500 py-8 sm:py-10">
              <p className="text-base sm:text-lg">
                No posts found matching your criteria.
              </p>
            </div>
          )}

          {!isLoading && (
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 sm:p-6 border border-base-300 bg-base-200 rounded-lg shadow-sm hover:shadow-md transition relative w-full"
                >
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 pr-16 sm:pr-20">
                    {post.title}
                  </h1>
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex gap-1 sm:gap-2">
                    <button
                      title="Approve Post"
                      className="btn btn-xs sm:btn-sm btn-success btn-circle"
                      onClick={() => openConfirmationModal("approve", post)}
                    >
                      <img
                        src={doneAll}
                        alt="Approve"
                        className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5"
                      />
                    </button>
                    <button
                      title="Delete Post"
                      className="btn btn-xs sm:btn-sm btn-error btn-circle"
                      onClick={() => openConfirmationModal("delete", post)}
                    >
                      <img
                        src={trashIcon}
                        alt="Delete"
                        className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5"
                      />
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-base-content/70 mb-2 sm:mb-3">
                    By {post.author_name} on{" "}
                    <span>
                      {new Date(post.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                  <p className="text-sm sm:text-base text-base-content/90 whitespace-pre-line break-words">
                    {post.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {!isLoading && totalPages > 1 && (
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mt-6 sm:mt-8 px-4">
              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx + 1}
                  className={`btn btn-xs sm:btn-sm ${
                    page === idx + 1 ? "border-amber-400" : "btn-ghost"
                  }`}
                  onClick={() => setPage(idx + 1)}
                  disabled={isLoading}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal element */}
      {modal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm p-4"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-base-200 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              {(modal.type === "approve" || modal.type === "success") && (
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-success flex items-center justify-center shrink-0">
                  <svg
                    className="w-3 h-3 sm:w-5 sm:h-5 text-success-content"
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
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-error flex items-center justify-center shrink-0">
                  <svg
                    className="w-3 h-3 sm:w-5 sm:h-5 text-error-content"
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
              <h3 className="font-bold text-base sm:text-lg" id="modal-title">
                {modal.type === "approve" && "Approve Post"}
                {(modal.type === "deleted" || modal.type === "delete") &&
                  "Delete Post"}
                {(modal.type === "success" || modal.type === "error") &&
                  "Approve Post"}
              </h3>
            </div>
            <p className="py-3 sm:py-4 text-sm sm:text-base">{modal.message}</p>
            <div className="flex justify-end gap-2 sm:gap-3 mt-3 sm:mt-4">
              {modal.type === "approve" || modal.type === "delete" ? (
                <>
                  <button
                    className="btn btn-ghost btn-sm sm:btn-md"
                    onClick={closeModal}
                    disabled={isActionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className={`btn btn-sm sm:btn-md ${
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

export default ManagePosts;
