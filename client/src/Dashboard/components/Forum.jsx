import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import commentIcon from "../../assets/images/comment.svg";
import trashIcon from "../../assets/images/delete.svg"; // Add this import
import Navbar from "./Navbar";
import { getForumPosts, deleteForumPost } from "@/services/forumService";
import { useAuth } from "@/contexts/AuthContext";
import { DatePicker } from "react-daisyui-timetools";
import "react-datepicker/dist/react-datepicker.css";

const Forum = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    type: "",
    postId: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const postsPerPage = 20;
  const { user } = useAuth();

  const defaultFilters = {
    topic: "all",
    dateSort: "newest",
    selectedDate: null,
    commentSort: "none",
    searchText: "",
  };

  const [filters, setFilters] = useState({ ...defaultFilters });
  const [showFilters, setShowFilters] = useState(false);

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

  // Only fetch posts on component mount
  useEffect(() => {
    fetchPosts(0, false, { ...defaultFilters });
  }, []);

  const fetchPosts = async (
    pageNum = 0,
    append = false,
    activeFilters = null
  ) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const filtersToApply = activeFilters
        ? { ...activeFilters }
        : { ...filters };

      Object.keys(filtersToApply).forEach((key) => {
        if (filtersToApply[key] === undefined) {
          filtersToApply[key] = null;
        }
      });

      const response = await getForumPosts(
        pageNum,
        postsPerPage,
        filtersToApply
      );
      const { forumPosts, totalCount } = response;
      setTotalPages(Math.max(1, Math.ceil(totalCount / postsPerPage)));
      setHasMore(pageNum < Math.ceil(totalCount / postsPerPage) - 1);

      if (append) {
        setPosts((prevPosts) => [...prevPosts, ...posts]);
      } else {
        setPosts(forumPosts);
      }

      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching forum posts:", error);

      if (error.response) {
        console.error("Error response:", error.response);
      }

      if (!append) {
        setPosts([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Apply all selected filters
  const applyFilters = async () => {
    // Make a copy of the current filters to ensure we're using the latest state
    const currentFilters = { ...filters };

    setLoading(true);

    setPage(0);

    setTimeout(async () => {
      try {
        console.log("Starting fetchPosts with filters:", currentFilters);
        await fetchPosts(0, false, currentFilters);
        console.log("Filters applied successfully");
      } catch (err) {
        console.error("Error applying filters:", err);
      }
    }, 100);
  };

  // Clear all filters and reset to default
  const clearFilters = async () => {
    console.log("Clearing filters, using defaults:", defaultFilters);

    // Show visual confirmation that filters are being cleared
    setLoading(true);

    // Update the filters state with a fresh copy of default filters
    const freshDefaultFilters = { ...defaultFilters };
    setFilters(freshDefaultFilters);

    // Reset to page 0 and fetch with default filters after a small delay
    setPage(0);

    // Force a small delay to ensure state updates have propagated
    setTimeout(async () => {
      await fetchPosts(0, false, freshDefaultFilters);
    }, 100);
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteForumPost(postId);

      // Refresh the posts after deletion with current filters
      await fetchPosts(0, false, { ...filters });
      showModal("Post deleted successfully.", "success");
    } catch (error) {
      console.error("Error deleting post:", error);
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

        {/* Filter Navbar */}
        <div className="sticky top-[76px] z-10 bg-base-200 border-b border-base-300 shadow-sm">
          <div className="p-3 sm:p-4 sm:pl-12 w-full max-w-full mx-auto">
            {/* Mobile Filter Toggle */}
            <div className="flex items-center justify-between mb-3 lg:hidden">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-sm btn-ghost"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            {/* Filter Controls */}
            <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 xl:grid-cols-8 gap-3 mb-3 max-w-full">
                {/* Search Filter - Takes 2 columns to be wider */}
                <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-2">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Search Posts
                  </label>
                  <input
                    type="text"
                    placeholder="Search titles and content..."
                    value={filters.searchText}
                    onChange={(e) =>
                      setFilters({ ...filters, searchText: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        applyFilters();
                      }
                    }}
                    className="input input-sm input-bordered w-full text-sm"
                  />
                </div>

                {/* Topic Filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Topic
                  </label>

                  <select
                    value={filters.topic}
                    onChange={(e) =>
                      setFilters({ ...filters, topic: e.target.value })
                    }
                    className="select select-sm w-full text-sm select-rounded"
                  >
                    <option value="all">All Topics</option>
                    <option value="general">General</option>
                    <option value="daily-challenge">Daily Challenge</option>
                  </select>
                </div>

                {/* Date Sort */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Date Order
                  </label>

                  <select
                    value={filters.dateSort}
                    onChange={(e) =>
                      setFilters({ ...filters, dateSort: e.target.value })
                    }
                    className="select select-sm select-bordered w-full text-sm"
                  >
                    <option value="newest">Most Recent</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>

                {/* Specific Date Filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Specific Date
                  </label>
                  <div className="border rounded">
                    <DatePicker
                      className="input input-sm w-full text-sm  border-none rounded shadow-none focus:ring-0 focus:border-none "
                      selected={
                        filters.selectedDate instanceof Date
                          ? filters.selectedDate
                          : filters.selectedDate
                          ? new Date(filters.selectedDate)
                          : null
                      }
                      onChange={(date) => {
                        // Ensure we're storing a valid Date object
                        if (date) {
                          try {
                            // Create a valid date object
                            const validDate = new Date(date);
                            // Check if it's a valid date
                            if (!isNaN(validDate.getTime())) {
                              setFilters({
                                ...filters,
                                selectedDate: validDate,
                              });
                            } else {
                              console.error("Invalid date selected:", date);
                              setFilters({ ...filters, selectedDate: null });
                            }
                          } catch (err) {
                            console.error("Error processing date:", err);
                            setFilters({ ...filters, selectedDate: null });
                          }
                        } else {
                          // Handle clearing the date
                          setFilters({ ...filters, selectedDate: null });
                        }
                      }}
                      placeholder={filters.selectedDate || "Select date"}
                      maxDate={new Date()}
                      dateFormat="MM/dd/yyyy"
                      showYearDropdown
                      showMonthDropdown
                      isClearable={true}
                    />
                  </div>
                </div>

                {/* Comment Sort */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Popularity
                  </label>
                  <select
                    value={filters.commentSort}
                    onChange={(e) =>
                      setFilters({ ...filters, commentSort: e.target.value })
                    }
                    className="select select-sm select-bordered w-full text-sm"
                  >
                    <option value="none">No Sorting</option>
                    <option value="most-popular">Most Popular</option>
                    <option value="least-popular">Least Popular</option>
                  </select>
                </div>

                {/* Clear Filters & Apply Buttons */}
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide opacity-0">
                    Actions
                  </label>
                  <div className="flex gap-1">
                    {(filters.topic !== "all" ||
                      filters.dateSort !== "newest" ||
                      filters.selectedDate ||
                      filters.commentSort !== "none" ||
                      (filters.searchText && filters.searchText.trim())) && (
                      <button
                        onClick={clearFilters}
                        className="cursor-pointer px-2 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs font-medium"
                      >
                        Clear Filters
                      </button>
                    )}
                    <button
                      onClick={applyFilters}
                      className="cursor-pointer px-2 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 text-xs font-medium"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              <div className="flex flex-wrap gap-2">
                {filters.topic !== "all" && (
                  <span className="badge badge-outline badge-sm flex items-center gap-1">
                    Topic:{" "}
                    {filters.topic === "general"
                      ? "General"
                      : "Daily Challenge"}
                    <button
                      type="button"
                      className="ml-1 text-xs font-bold hover:text-error hover:cursor-pointer focus:outline-none"
                      onClick={() => {
                        const newFilters = { ...filters, topic: "all" };
                        setFilters(newFilters);
                        fetchPosts(0, false, newFilters);
                      }}
                      aria-label="Remove topic filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.searchText && filters.searchText.trim() && (
                  <span className="badge badge-outline badge-sm flex items-center gap-1">
                    Search: "{filters.searchText.trim()}"
                    <button
                      type="button"
                      className="ml-1 text-xs font-bold hover:text-error hover:cursor-pointer focus:outline-none"
                      onClick={() => {
                        const newFilters = { ...filters, searchText: "" };
                        setFilters(newFilters);
                        fetchPosts(0, false, newFilters);
                      }}
                      aria-label="Remove search filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.dateSort !== "newest" && (
                  <span className="badge badge-outline badge-sm flex items-center gap-1">
                    Sort:{" "}
                    {filters.dateSort === "oldest"
                      ? "Oldest First"
                      : "Most Recent"}
                    <button
                      type="button"
                      className="ml-1 text-xs font-bold hover:text-error hover:cursor-pointerfocus:outline-none"
                      onClick={() => {
                        const newFilters = { ...filters, dateSort: "newest" };
                        setFilters(newFilters);
                        fetchPosts(0, false, newFilters);
                      }}
                      aria-label="Remove sort filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.selectedDate && (
                  <span className="badge badge-outline badge-sm flex items-center gap-1">
                    Date:{" "}
                    {filters.selectedDate instanceof Date
                      ? filters.selectedDate.toLocaleDateString()
                      : new Date(filters.selectedDate).toLocaleDateString()}
                    <button
                      type="button"
                      className="ml-1 text-xs font-bold hover:text-error  hover:cursor-pointerfocus:outline-none"
                      onClick={() => {
                        const newFilters = { ...filters, selectedDate: null };
                        setFilters(newFilters);
                        fetchPosts(0, false, newFilters);
                      }}
                      aria-label="Remove date filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.commentSort !== "none" && (
                  <span className="badge badge-outline badge-sm flex items-center gap-1">
                    {filters.commentSort === "most-popular"
                      ? "Most Popular"
                      : "Least Popular"}
                    <button
                      type="button"
                      className="ml-1 text-xs font-bold hover:text-error hover:cursor-pointer focus:outline-none"
                      onClick={() => {
                        const newFilters = { ...filters, commentSort: "none" };
                        setFilters(newFilters);
                        fetchPosts(0, false, newFilters);
                      }}
                      aria-label="Remove popularity filter"
                    >
                      ×
                    </button>
                  </span>
                )}
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
              {/* Scrollable Posts Content */}
              <div className=" overflow-y-auto">
                <div className="p-4 sm:p-6 sm:pl-12 w-full">
                  {posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="text-2xl font-semibold text-gray-400 mb-2">
                        No posts found
                      </div>
                      <p className="text-gray-500 text-center">
                        There are no posts that match your selected filters.
                      </p>
                      <button
                        onClick={clearFilters}
                        className="mt-4 cursor-pointer px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 text-sm font-medium"
                      >
                        Clear Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2   lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                      {posts.map((post) => (
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
                                navigate(`/dashboard/forum-detail/${post.id}`, {
                                  state: { post },
                                });
                              }}
                            >
                              {post.title}
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <p className="text-xs sm:text-sm text-gray-500 flex flex-col sm:flex-row items-center sm:justify-start gap-0 sm:gap-2">
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
                                {new Date(post.date_created).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </span>
                            </p>

                            {/* Topic Badge */}
                            <span
                              className={`inline-block text-xs font-semibold px-2 py-1 rounded ${
                                post.topic === "general"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {post.topic === "general"
                                ? "General"
                                : "Daily Challenge"}
                            </span>

                            {/* Challenge Title Badge */}
                            {post.challengeTitle && (
                              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                                {post.challengeTitle}
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-gray-400 text-sm sm:text-base line-clamp-3 text-center sm:text-left flex-grow">
                            {post.content && post.content.length > 100
                              ? post.content.slice(0, 100) + "..."
                              : post.content}
                          </p>

                          <div
                            className="mt-3 sm:mt-4 flex justify-center sm:justify-end items-center gap-2 cursor-pointer"
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
                  )}

                  {!loading && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => fetchPosts(page - 1, false, filters)}
                        disabled={loading || page === 0}
                        title="Previous Page"
                      >
                        ←
                      </button>

                      {Array.from(
                        { length: Math.min(3, totalPages) },
                        (_, idx) => (
                          <button
                            key={idx}
                            className={`btn btn-sm ${
                              page === idx ? "border-amber-400" : "btn-ghost"
                            }`}
                            onClick={() => fetchPosts(idx, false, filters)}
                            disabled={loading}
                          >
                            {idx + 1}
                          </button>
                        )
                      )}

                      {totalPages > 3 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}

                      {page > 2 && page < totalPages - 1 && (
                        <button
                          className="btn btn-sm border-amber-400"
                          onClick={() => fetchPosts(page, false, filters)}
                          disabled={loading}
                        >
                          {page + 1}
                        </button>
                      )}

                      {totalPages > 3 && (
                        <button
                          className={`btn btn-sm ${
                            page === totalPages - 1
                              ? "border-amber-400"
                              : "btn-ghost"
                          }`}
                          onClick={() =>
                            fetchPosts(totalPages - 1, false, filters)
                          }
                          disabled={loading}
                        >
                          {totalPages}
                        </button>
                      )}

                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => fetchPosts(page + 1, false, filters)}
                        disabled={loading || page === totalPages - 1}
                        title="Next Page"
                      >
                        →
                      </button>
                    </div>
                  )}
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
