import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import commentIcon from "../../assets/images/comment.svg";
import trashIcon from "../../assets/images/delete.svg";
import Navbar from "./Navbar";
import { getForumPosts, deleteForumPost } from "@/services/forumService";
import { useAuth } from "@/contexts/AuthContext";
import { DatePicker } from "react-daisyui-timetools";
import "react-datepicker/dist/react-datepicker.css";
import CalendarPopover from "./CalendarPopover";
// import { useForumSearchParams } from "../../contexts/ForumSearchParamsContext";
const Forum = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [forumSearchParams, setForumSearchParams] = useSearchParams();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    type: "",
    postId: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const postsPerPage = 10;
  const { user } = useAuth();

  const defaultFilters = {
    topic: "all",
    dateSort: "newest",
    selectedDate: null,
    commentSort: "none",
    searchText: "",
  };

  const [filters, setFilters] = useState(() => {
    const initialFilters = { ...defaultFilters };
    for (const [key, value] of forumSearchParams.entries()) {
      if (key in initialFilters) {
        initialFilters[key] = value;
      }
    }
    return initialFilters;
  });
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

  const fetchPosts = useCallback(
    async (pageNum = 0, append = false, activeFilters = null) => {
      try {
        setLoading(true);

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

        setPosts(forumPosts || []);

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
    },
    [postsPerPage]
  );
  useEffect(() => {
    const pageFromUrl = parseInt(forumSearchParams.get("page") || "1", 10);
    const filtersFromUrl = { ...defaultFilters };
    for (const [key, value] of forumSearchParams.entries()) {
      if (key in filtersFromUrl) {
        filtersFromUrl[key] = value;
      }
    }

    setFilters(filtersFromUrl);
    fetchPosts(pageFromUrl, false, filtersFromUrl);
  }, [forumSearchParams, fetchPosts]);

  const applyFilters = () => {
    const newSearchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(filters)) {
      if (value && value !== defaultFilters[key]) {
        newSearchParams.set(key, value);
      }
    }
    newSearchParams.set("page", "1");
    setForumSearchParams(newSearchParams);
  };

  const handleRemoveFilter = (filterKey) => {
    const newFilters = { ...filters, [filterKey]: defaultFilters[filterKey] };
    setFilters(newFilters);

    if (forumSearchParams.has(filterKey)) {
      const newSearchParams = new URLSearchParams(forumSearchParams);
      newSearchParams.delete(filterKey);
      setPage(1);
      newSearchParams.set("page", "1");
      setForumSearchParams(newSearchParams);
    }
  };

  const clearFilters = async () => {
    setLoading(true);

    const freshDefaultFilters = { ...defaultFilters };
    setFilters(freshDefaultFilters);
    setForumSearchParams({ page: "1" });

    setPage(1);

    await fetchPosts(1, false, freshDefaultFilters);
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteForumPost(postId);

      await fetchPosts(1, false, { ...filters });
      showModal("Post deleted successfully.", "success");
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };
  const formatFilterLabel = (value) => {
    if (!value) return "";
    return value
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div data-theme="luxury" className="flex flex-col h-screen bg-base-100">
      <div className="flex-1">
        <div className="sticky top-0 z-20 bg-base-100">
          <div className="flex flex-col">
            {/*Header */}
            <div className="pt-3 pr-3 flex gap-3 justify-end">
              <button
                onClick={() => {
                  navigate(`/dashboard/create-post`, {
                    state: {
                      from: "/dashboard/forum",
                      fromForumSearch: forumSearchParams.toString(),
                    },
                  });
                }}
                className="btn bg-[#FFB800] text-black btn-sm gap-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="sm:inline">Create Post</span>
              </button>
              <button
                onClick={() => {
                  navigate(`/dashboard/user-posts`, {
                    state: {
                      from: "/dashboard/forum",
                      fromForumSearch: forumSearchParams.toString(),
                    },
                  });
                }}
                className="hidden sm:btn sm:btn-outline sm:btn-sm sm:gap-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="hidden sm:inline">Your Posts</span>
              </button>
            </div>
            <div className="border-b border-base-300 shadow-sm">
              <div className="p-3 sm:p-4 md:pl-12 w-full max-w-full mx-auto">
                <div className="flex items-center justify-between mb-3 lg:hidden ">
                  <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    Filters
                    {(filters.topic !== "all" ||
                      filters.dateSort !== "newest" ||
                      filters.selectedDate ||
                      (filters.searchText && filters.searchText.trim())) && (
                      <span className="badge badge-sm bg-yellow-500 text-black border-none">
                        {
                          [
                            filters.topic !== "all",
                            filters.dateSort !== "newest",
                            filters.selectedDate,
                            filters.commentSort !== "none",
                            filters.searchText && filters.searchText.trim(),
                          ].filter(Boolean).length
                        }
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn btn-sm btn-ghost px-2"
                  >
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${
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

                {/* Filters */}
                <div
                  className={`transition-all duration-300 ${
                    showFilters ? "block opacity-100" : "hidden opacity-0"
                  } lg:block lg:opacity-100`}
                >
                  <div className="space-y-2 lg:space-y-0 lg:grid lg:grid-cols-6 xl:grid-cols-8 lg:gap-2 mb-2 max-w-full">
                    <div className="flex flex-col gap-1 lg:col-span-2">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Search Posts
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search by title, content or challenge"
                          title="Search by title, content or challenge"
                          value={filters.searchText}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              searchText: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              applyFilters();
                            }
                          }}
                          className="input input-sm input-bordered w-full text-xs pl-8 pr-2 h-8 truncate"
                        />
                        <svg
                          className="z-10 w-3.5 h-3.5 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 lg:contents">
                      <div className="flex flex-col gap-1 lg:col-span-1">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Topic
                        </label>
                        <select
                          value={filters.topic}
                          onChange={(e) =>
                            setFilters({ ...filters, topic: e.target.value })
                          }
                          className="select select-sm select-bordered w-full text-xs h-8 min-h-8"
                        >
                          <option value="all">All Topics</option>
                          <option value="general">General</option>
                          <option value="daily-challenge">
                            Daily Challenge
                          </option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1 lg:col-span-1">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Date Order
                        </label>
                        <select
                          value={filters.dateSort}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              dateSort: e.target.value,
                            })
                          }
                          className="select select-sm select-bordered w-full text-xs h-8 min-h-8"
                        >
                          <option value="newest">Most Recent</option>
                          <option value="past-week">Past Week</option>
                          <option value="past-month">Past Month</option>
                          <option value="past-year">Past Year</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2 lg:space-y-0 lg:contents">
                      <div className="flex flex-col gap-1 lg:col-span-1">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Populrarity
                        </label>
                        <select
                          value={filters.commentSort}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              commentSort: e.target.value,
                            })
                          }
                          className="select select-sm select-bordered w-full text-xs h-8 min-h-8"
                        >
                          <option value="none">No Sorting</option>
                          <option value="most-popular">Most Popular</option>
                          <option value="least-popular">Least Popular</option>
                        </select>
                      </div>

                      <div className="relative flex flex-col gap-1 lg:col-span-1">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Specific Date
                        </label>

                        <div className="relative">
                          <input
                            type="text"
                            readOnly
                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                            value={
                              filters.selectedDate
                                ? new Date(
                                    filters.selectedDate
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : ""
                            }
                            placeholder="Select date"
                            className="input input-sm input-bordered w-full text-xs pl-8 pr-2 cursor-pointer h-8"
                          />
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            // Position the icon inside the input field
                            className="z-10 w-3.5 h-3.5 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
                            />
                          </svg>
                        </div>

                        <CalendarPopover
                          isOpen={isCalendarOpen}
                          onClose={() => setIsCalendarOpen(false)}
                          selectedDate={filters.selectedDate}
                          onDateSelect={(date) => {
                            setFilters({ ...filters, selectedDate: date });
                          }}
                          isFromManageChallenges={false}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 lg:col-span-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide opacity-0">
                        Actions
                      </label>
                      <div className="flex gap-1.5">
                        {(filters.topic !== "all" ||
                          filters.dateSort !== "newest" ||
                          filters.commentSort !== "none" ||
                          filters.selectedDate ||
                          (filters.searchText &&
                            filters.searchText.trim())) && (
                          <button
                            onClick={clearFilters}
                            className="cursor-pointer px-2 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-xs font-medium transition-colors duration-200 flex-1 lg:flex-none h-8"
                          >
                            <span className="lg:hidden">Clear Filters</span>
                            <span className="hidden lg:inline">
                              Clear Filters
                            </span>
                          </button>
                        )}
                        <button
                          onClick={applyFilters}
                          className="cursor-pointer px-2 py-1.5 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 text-xs font-medium transition-colors duration-200 flex-1 lg:flex-none h-8"
                        >
                          <span className="lg:hidden">Apply Filters</span>
                          <span className="hidden lg:inline">
                            Apply Filters
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {filters.topic !== "all" && (
                      <span className="badge badge-outline badge-sm flex items-center gap-1 px-2 py-1">
                        <span className="font-medium text-xs">
                          {filters.topic === "general"
                            ? "General"
                            : "Daily Challenge"}
                        </span>
                        <button
                          type="button"
                          className="ml-1 text-xs font-bold hover:text-error hover:cursor-pointer focus:outline-none"
                          onClick={() => handleRemoveFilter("topic")}
                          aria-label="Remove topic filter"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.searchText && filters.searchText.trim() && (
                      <span className="badge badge-outline badge-sm flex items-center gap-1 px-2 py-1 max-w-[200px]">
                        <span className="font-medium text-xs truncate">
                          "{filters.searchText.trim()}"
                        </span>
                        <button
                          type="button"
                          className="ml-1 text-xs font-bold hover:text-error hover:cursor-pointer focus:outline-none"
                          onClick={() => handleRemoveFilter("searchText")}
                          aria-label="Remove search filter"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.commentSort != "none" &&
                      filters.commentSort.trim() && (
                        <span className="badge badge-outline badge-sm flex items-center gap-1 px-2 py-1 max-w-[200px]">
                          <span className="font-medium text-xs truncate">
                            {formatFilterLabel(filters.commentSort)}
                          </span>
                          <button
                            type="button"
                            className="ml-1 text-xs font-bold hover:text-error hover:cursor-pointer focus:outline-none"
                            onClick={() => handleRemoveFilter("commentSort")}
                            aria-label="Remove search filter"
                          >
                            ×
                          </button>
                        </span>
                      )}

                    {filters.dateSort !== "newest" && (
                      <span className="badge badge-outline badge-sm flex items-center gap-1 px-2 py-1">
                        <span className="font-medium text-xs">
                          {formatFilterLabel(filters.dateSort)}
                        </span>
                        <button
                          type="button"
                          className="ml-1 text-xs font-bold hover:text-error hover:cursor-pointer focus:outline-none"
                          onClick={() => handleRemoveFilter("dateSort")}
                          aria-label="Remove sort filter"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.selectedDate && (
                      <span className="badge badge-outline badge-sm flex items-center gap-1 px-2 py-1">
                        <span className="font-medium text-xs">
                          {new Date(filters.selectedDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                        <button
                          type="button"
                          className="ml-1 text-xs font-bold hover:text-error hover:cursor-pointer focus:outline-none"
                          onClick={() => handleRemoveFilter("selectedDate")}
                          aria-label="Remove date filter"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content  */}
        <div className="overflow-y-auto">
          <div className="p-3 sm:p-4 md:p-6 md:pl-12 w-full">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <span className="loading loading-spinner loading-md sm:loading-lg"></span>
              </div>
            ) : (
              <>
                {posts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="text-xl sm:text-2xl font-semibold text-gray-400 mb-2">
                      No posts found
                    </div>
                    <p className="text-gray-500 text-center text-sm sm:text-base">
                      There are no posts that match your selected filters.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="mt-4 cursor-pointer px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 text-sm font-medium transition-colors duration-200"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div
                    className="
  grid grid-cols-1 
  sm:grid-cols-2 
  [@media(min-width:2000px)]:grid-cols-4
  gap-4 lg:gap-6
"
                  >
                    {posts.filter(Boolean).map((post) => (
                      <div
                        key={post.id}
                        className="card bg-base-200 shadow-md md:scale-95 lg:scale-100 hover:shadow-lg transition-all duration-300 border h-full flex flex-col"
                      >
                        <div className="card-body p-2 sm:p-3 md:p-2.5 lg:p-4 xl:p-5 flex flex-col h-full relative">
                          {(post.author_name === user.name ||
                            post.author_name === user.username ||
                            user.isModerator) && (
                            <button
                              className="absolute top-1 right-1 p-1 cursor-pointer rounded-full hover:bg-base-300 transition-colors"
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
                                className="w-3 h-3 sm:w-4 sm:h-4 2xl:h-5 2xl:w-5"
                              />
                            </button>
                          )}

                          <h1
                            className="text-base sm:text-lg md:text-base lg:text-2xl font-bold mb-2 pr-8 sm:pr-12 cursor-pointer break-words"
                            onClick={() => {
                              navigate(`/dashboard/forum-detail/${post.id}`, {
                                state: {
                                  post,
                                  fromForumSearch: forumSearchParams.toString(),
                                },
                              });
                            }}
                          >
                            {post.title}
                          </h1>

                          <div className="flex flex-wrap items-center gap-1 mb-0.5">
                            <span
                              className={`inline-block text-xs font-medium px-1 py-0.5 rounded ${
                                post.topic === "general"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {post.topic === "general"
                                ? "General"
                                : "Daily Challenge"}
                            </span>
                            {post.challengeTitle && (
                              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-1 py-0.5 rounded truncate max-w-[120px]">
                                {formatFilterLabel(post.challengeTitle)}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-base-content/70 mb-1 sm:mb-2">
                            By{" "}
                            <span className="font-semibold">
                              {post.author_name}
                            </span>
                            <span className="mx-1">·</span>
                            <span className="italic">
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

                          <p className="hidden sm:block text-sm md:text-xs lg:text-sm 2xl:text-lg text-base-content/80 line-clamp-1 mb-auto">
                            {post.content && post.content.length > 50
                              ? post.content.slice(0, 50) + "..."
                              : post.content}
                          </p>

                          <div className="card-actions justify-end mt-2">
                            <div
                              className="flex items-center gap-1 cursor-pointer"
                              onClick={() => {
                                navigate(`/dashboard/forum-detail/${post.id}`, {
                                  state: { post },
                                });
                              }}
                            >
                              <p className="text-xs font-medium">
                                {post.comment_count}
                              </p>
                              <img
                                src={commentIcon}
                                alt="Comment"
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 hover:opacity-80"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!loading && (
                  <div className="flex justify-center items-center gap-1 sm:gap-2 mt-6 sm:mt-8">
                    <button
                      className="btn btn-sm btn-ghost px-2 sm:px-3"
                      onClick={() => {
                        const newPage = page - 1;
                        forumSearchParams.set("page", newPage.toString());
                        setForumSearchParams(forumSearchParams);
                      }}
                      disabled={loading || page === 1}
                      title="Previous Page"
                    >
                      ←
                    </button>

                    {Array.from(
                      { length: Math.min(3, totalPages) },
                      (_, idx) => (
                        <button
                          key={idx}
                          className={`btn btn-sm px-2 sm:px-3 ${
                            page - 1 === idx ? "border-amber-400" : "btn-ghost"
                          }`}
                          onClick={() => {
                            forumSearchParams.set("page", (idx + 1).toString());
                            setForumSearchParams(forumSearchParams);
                          }}
                          disabled={loading}
                        >
                          {idx + 1}
                        </button>
                      )
                    )}

                    {totalPages > 3 && (
                      <span className="px-1 sm:px-2 text-gray-500 text-sm">
                        ...
                      </span>
                    )}

                    {page > 2 && page < totalPages - 1 && (
                      <button
                        className="btn btn-sm border-amber-400 px-2 sm:px-3"
                        onClick={() => {
                          forumSearchParams.set("page", page.toString());
                          setForumSearchParams(forumSearchParams);
                        }}
                        disabled={loading}
                      >
                        {page + 1}
                      </button>
                    )}

                    {totalPages > 3 && (
                      <button
                        className={`btn btn-sm px-2 sm:px-3 ${
                          page === totalPages ? "border-amber-400" : "btn-ghost"
                        }`}
                        onClick={() => {
                          forumSearchParams.set("page", totalPages.toString());
                          setForumSearchParams(forumSearchParams);
                        }}
                        disabled={loading}
                      >
                        {totalPages}
                      </button>
                    )}

                    <button
                      className="btn btn-sm btn-ghost px-2 sm:px-3"
                      onClick={() => {
                        const newPage = page + 1;
                        forumSearchParams.set("page", newPage.toString());
                        setForumSearchParams(forumSearchParams);
                      }}
                      disabled={loading || page === totalPages}
                      title="Next Page"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal  */}
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
