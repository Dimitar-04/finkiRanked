import { useAuth } from "../../contexts/AuthContext.jsx";
import { act, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getPendingPosts } from "@/services/reviewService";
import { getAllPostsByUser, deleteForumPost } from "@/services/forumService.js";
import { deleteReviewPost } from "@/services/reviewService";
import commentIcon from "../../assets/images/comment.svg";
import CalendarPopover from "./CalendarPopover.jsx";
import { DatePicker } from "react-daisyui-timetools";
import "react-datepicker/dist/react-datepicker.css";
import trashIcon from "../../assets/images/delete.svg";

const UserPosts = () => {
  const { user } = useAuth();
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const location = useLocation();
  const fromPath = location.state?.from || "/dashboard/forum";

  const fromForumSearchParams = location.state?.fromForumSearch;
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("published");
  const navigate = useNavigate();
  const [totalUserPosts, setTotalUserPosts] = useState(0);
  const [totalPendingPosts, setTotalPendingPosts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pendingCurrentPage, setPendingCurrentPage] = useState(() => {
    return parseInt(searchParams.get("pendingPage") || "1", 10);
  });
  const PENDING_PAGE_SIZE = 10;

  // Filter states
  const defaultFilters = {
    topic: "all",
    dateSort: "newest",
    selectedDate: null,
    commentSort: "none",
    searchText: "",
  };
  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    type: "",
    postId: null,
  });
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
  const confirmRemoval = async () => {
    if (modal.postId) {
      setIsDeleting(true);
      try {
        await deleteReviewPost(modal.postId, user.id);

        const data = await getPendingPosts();
        setPendingPosts(data.pendingPosts);
        setTotalPendingPosts(data.pendingCount);

        const newTotalPages = Math.ceil(data.length / PENDING_PAGE_SIZE);
        if (pendingCurrentPage > newTotalPages && newTotalPages > 0) {
          handlePendingPageChange(newTotalPages);
        }

        closeModal();
        showModal("Post removed successfully.", "success");
      } catch (error) {
        console.error("Error removing post:", error);
        closeModal();
        showModal("Failed to remove post. Please try again.", "error");
      } finally {
        setIsDeleting(false);
      }
    }
  };
  const handleDeletePost = async (postId) => {
    try {
      await deleteForumPost(postId);

      const filtersForBackend = { ...defaultFilters };
      for (const [key, value] of searchParams.entries()) {
        if (key in filtersForBackend) {
          filtersForBackend[key] = value;
        }
      }
      const approvedData = await getAllPostsByUser(
        currentPage,
        10,
        filtersForBackend
      );
      setApprovedPosts(approvedData.posts || []);
      setTotalPages(approvedData.totalPages || 1);
      setTotalUserPosts(approvedData.userPostsCount);
      closeModal();
      showModal("Post deleted successfully.", "success");
    } catch (error) {
      console.error("Error deleting post:", error);
      closeModal();
      showModal("Failed to delete post. Please try again.", "error");
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState(() => {
    const initialFilters = { ...defaultFilters };
    const urlParams = new URLSearchParams(window.location.search);
    for (const [key, value] of urlParams.entries()) {
      if (key in initialFilters) {
        initialFilters[key] = value;
      }
    }
    return initialFilters;
  });

  const [showFilters, setShowFilters] = useState(false);
  const pendingTotalPages = Math.ceil(pendingPosts.length / PENDING_PAGE_SIZE);
  const paginatedPendingPosts = pendingPosts.slice(
    (pendingCurrentPage - 1) * PENDING_PAGE_SIZE,
    pendingCurrentPage * PENDING_PAGE_SIZE
  );

  const applyFilters = () => {
    const newSearchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value && String(value) !== String(defaultFilters[key])) {
        newSearchParams.set(key, value);
      }
    }
    newSearchParams.set("page", "1");
    setCurrentPage(1);
    if (searchParams.get("pendingPage")) {
      newSearchParams.set("pendingPage", searchParams.get("pendingPage"));
    }
    setSearchParams(newSearchParams);
  };
  const handleRemoveFilter = (filterKey) => {
    const newFilters = { ...filters, [filterKey]: defaultFilters[filterKey] };
    setFilters(newFilters);

    if (searchParams.has(filterKey)) {
      setAppliedFilters(newFilters);

      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete(filterKey);
      setCurrentPage(1);
      newSearchParams.set("page", "1");
      setSearchParams(newSearchParams);
    } else {
      setAppliedFilters(newFilters);
    }
  };

  const clearFilters = () => {
    setFilters({ ...defaultFilters });
    setAppliedFilters({ defaultFilters });
    const newSearchParams = new URLSearchParams();
    newSearchParams.set("page", "1");
    if (searchParams.get("pendingPage")) {
      newSearchParams.set("pendingPage", searchParams.get("pendingPage"));
    }
    setCurrentPage(1);
    setSearchParams(newSearchParams);
  };
  const handlePendingPageChange = (newPage) => {
    setPendingCurrentPage(newPage);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("pendingPage", newPage.toString());
    setSearchParams(newSearchParams);
  };
  const formatFilterLabel = (value) => {
    if (!value) return "";
    return value
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  useEffect(() => {
    const pendingPageFromUrl = parseInt(
      searchParams.get("pendingPage") || "1",
      10
    );
    setPendingCurrentPage(pendingPageFromUrl);
  }, [searchParams]);
  useEffect(() => {
    if (user?.id) {
      const fetchPosts = async () => {
        setLoading(true);
        try {
          const filtersForBackend = { ...defaultFilters };
          for (const [key, value] of searchParams.entries()) {
            if (key in filtersForBackend) {
              filtersForBackend[key] = value;
            }
          }
          const approvedData = await getAllPostsByUser(
            currentPage,
            10,
            filtersForBackend
          );
          setApprovedPosts(approvedData.posts || []);
          setTotalPages(approvedData.totalPages || 1);
          setTotalUserPosts(approvedData.userPostsCount);
        } catch (error) {
          console.error("Error fetching user posts:", error);
          setApprovedPosts([]); // Clear posts on error
          setTotalPages(1);
        } finally {
          setLoading(false);
        }
      };

      fetchPosts();
    }
  }, [user?.id, searchParams, currentPage]);

  useEffect(() => {
    const fetchPendingPosts = async () => {
      const data = await getPendingPosts();
      setPendingPosts(data.pendingPosts);
      setTotalPendingPosts(data.pendingCount);
    };
    fetchPendingPosts();
  }, []);

  return (
    <div data-theme="luxury" className="min-h-screen bg-base-100">
      <div className="flex flex-col h-screen">
        <div className="sticky top-0 z-20 bg-base-100">
          <div className="p-3 sm:p-3 sm:pl-12 w-full max-w-full mx-auto">
            <div className="flex justify-between items-center gap-2 sm:gap-4 sm:relative">
              {/* Mobile: Left - Tab buttons, Desktop: Center */}
              <div className="rounded-lg bg-base-300 p-1 flex gap-2 flex-shrink min-w-0 sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2">
                <button
                  className={`tab tab-sm sm:tab-md lg:tab-lg rounded-lg ${
                    activeTab === "published"
                      ? "tab-active bg-[#FFB800] text-black hover:text-black"
                      : "hover:bg-base-200"
                  } px-2 sm:px-4 whitespace-nowrap`}
                  onClick={() => setActiveTab("published")}
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span className="text-xs sm:text-sm lg:text-base">
                    Published ({totalUserPosts})
                  </span>
                </button>
                <button
                  className={`tab tab-sm sm:tab-md lg:tab-lg rounded-lg ${
                    activeTab === "pending"
                      ? "tab-active bg-[#FFB800] text-black hover:text-black"
                      : "hover:bg-base-200"
                  } px-2 sm:px-4 whitespace-nowrap`}
                  onClick={() => setActiveTab("pending")}
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span className="text-xs sm:text-sm lg:text-base">
                    Pending ({pendingPosts.length})
                  </span>
                </button>
              </div>

              {/* Right - Action buttons */}
              <div className="flex gap-2 sm:gap-3 flex-shrink-0 ml-auto">
                <button
                  onClick={() => {
                    navigate(`/dashboard/create-post`, {
                      state: {
                        from: "/dashboard/user-posts",
                        fromUserPostsSearch: searchParams.toString(),
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
                  <span className="hidden sm:inline">Create Post</span>
                </button>
                <button
                  onClick={() => {
                    const targetUrl = fromForumSearchParams
                      ? `${fromPath}?${fromForumSearchParams}`
                      : fromPath;
                    navigate(targetUrl);
                  }}
                  className="hidden sm:btn sm:btn-outline sm:btn-sm sm:gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <span className="hidden sm:inline">View Forum</span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            {/* Sticky Header Section */}

            {/* Filter Navbar */}
            {activeTab == "published" && (
              <div className="border-b border-base-300 shadow-sm">
                <div className="p-3 sm:p-4 md:pl-12 w-full max-w-full mx-auto">
                  {/* Mobile Filter Toggle */}
                  <div className="flex items-center justify-between mb-3 lg:hidden ">
                    <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                      Filters
                      {/* Active filter count indicator */}
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

                  {/* Filter Controls */}
                  <div
                    className={`transition-all duration-300 ${
                      showFilters ? "block opacity-100" : "hidden opacity-0"
                    } lg:block lg:opacity-100`}
                  >
                    {/* Mobile-First Filter Layout - Compact Version */}
                    <div className="space-y-2 lg:space-y-0 lg:grid lg:grid-cols-6 xl:grid-cols-8 lg:gap-2 mb-2 max-w-full">
                      {/* Search Filter - Full width on mobile, 2 cols on desktop */}
                      <div className="flex flex-col gap-1 lg:col-span-2">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Search Posts
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search by title, content or challenge"
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
                            className="input input-sm input-bordered w-full text-xs pl-8 pr-2 h-8"
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

                      {/* Mobile: 2-column grid for selects */}
                      <div className="grid grid-cols-2 gap-2 lg:contents">
                        {/* Topic Filter */}
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

                        {/* Date Sort */}
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
                            <option value="oldest-first">Oldest First</option>
                          </select>
                        </div>
                      </div>

                      {/* Mobile: Single column for date picker and popularity */}
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
                        {/* Specific Date Filter */}
                        <div className="relative flex flex-col gap-1 lg:col-span-1">
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Specific Date
                          </label>

                          <div className="relative">
                            <input
                              type="text"
                              readOnly // Makes the input non-editable by typing
                              onClick={() => setIsCalendarOpen(!isCalendarOpen)} // Opens popover on click
                              value={
                                filters.selectedDate
                                  ? new Date(
                                      filters.selectedDate
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : "" // Use empty string so placeholder is visible
                              }
                              placeholder="Select date"
                              // Style to match other inputs and add cursor-pointer
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
                          {/* Render the popover here */}
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

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-1 lg:col-span-1">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide opacity-0">
                          Actions
                        </label>
                        <div className="flex gap-1.5">
                          {(filters.topic !== "all" ||
                            filters.dateSort !== "newest" ||
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

                    {/* Active Filters Display - Improved Mobile Layout */}
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
                            {filters.dateSort === "oldest-first"
                              ? "Oldest First"
                              : "Most Recent"}
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
            )}
          </div>
        </div>

        {/* Main Content Area */}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <span className="loading loading-spinner loading-md sm:loading-lg"></span>
            </div>
          ) : (
            <div className="h-full">
              <div className="flex items-center">
                <div className="p-4 sm:p-6 sm:pl-12 w-full">
                  {/* Tab Content */}
                  <div className="animate-fadeIn">
                    {activeTab === "published" && (
                      <div>
                        {approvedPosts.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-2 3xl:grid-cols-4 gap-4 lg:gap-6">
                            {approvedPosts.map((post) => (
                              <div
                                key={post.id}
                                className="card bg-base-200 shadow-lg hover:shadow-xl transition-all duration-300 border h-full flex flex-col"
                              >
                                <div className="card-body p-3 sm:p-4 lg:p-6 flex flex-col h-full">
                                  <button
                                    className="absolute top-1 right-1 p-1 cursor-pointer rounded-full hover:bg-base-300 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      showModal(
                                        `Are you sure you want to delete post with title '${post.title}' ? This action cannot be undone.`,
                                        "confirm",
                                        post.id
                                      );
                                    }}
                                  >
                                    <img
                                      src={trashIcon}
                                      alt="Delete"
                                      className="w-3 h-3 sm:w-5 sm:h-5"
                                    />
                                  </button>
                                  <div className="flex">
                                    <h3
                                      className="text-sm sm:text-base lg:text-lg mb-2 sm:mb-3 text-base-content break-words hover:underline cursor-pointer min-w-0"
                                      onClick={() => {
                                        navigate(
                                          `/dashboard/forum-detail/${post.id}`,
                                          {
                                            state: {
                                              post,
                                              from: "/dashboard/user-posts",
                                            },
                                          }
                                        );
                                      }}
                                    >
                                      {post.title}
                                    </h3>
                                  </div>

                                  {/* Topic Badge */}
                                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                                    <span
                                      className={`inline-block text-xs font-semibold px-1.5 py-0.5 rounded ${
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
                                      <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-1.5 py-0.5 rounded">
                                        {formatFilterLabel(post.challengeTitle)}
                                      </span>
                                    )}
                                  </div>

                                  <p className="mt-2 text-gray-400 text-xs sm:text-sm lg:text-base line-clamp-3 flex-grow">
                                    {post.content && post.content.length > 150
                                      ? post.content.slice(0, 150) + "..."
                                      : post.content}
                                  </p>
                                  <div className="flex items-center text-xs sm:text-sm text-base-content/60 mb-3 sm:mb-4 mt-2">
                                    <svg
                                      className="w-3 h-3 sm:w-4 sm:h-4 mr-2"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      ></path>
                                    </svg>
                                    {new Date(
                                      post.date_created
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </div>

                                  <div className="card-actions justify-end mt-auto">
                                    <div className="flex items-center space-x-2">
                                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm lg:text-base">
                                        {post.comment_count}
                                        <img
                                          src={commentIcon}
                                          alt="Comment"
                                          className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 hover:opacity-80"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {!loading && (
                              <div className="md:col-span-2 2xl:col-span-2 3xl:col-span-4 flex justify-center items-center gap-1 sm:gap-2 mt-6 sm:mt-8">
                                <button
                                  className="btn btn-sm btn-ghost px-2 sm:px-3"
                                  onClick={() => {
                                    const newPage = currentPage - 1;
                                    searchParams.set(
                                      "page",
                                      newPage.toString()
                                    );
                                    setCurrentPage(newPage);
                                    setSearchParams(searchParams);
                                  }}
                                  disabled={loading || currentPage === 1}
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
                                        currentPage - 1 === idx
                                          ? "border-amber-400"
                                          : "btn-ghost"
                                      }`}
                                      onClick={() => {
                                        searchParams.set(
                                          "page",
                                          (idx + 1).toString()
                                        );
                                        setSearchParams(searchParams);
                                        setCurrentPage(idx + 1);
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

                                {currentPage > 2 &&
                                  currentPage < totalPages - 1 && (
                                    <button
                                      className="btn btn-sm border-amber-400 px-2 sm:px-3"
                                      onClick={() => {
                                        searchParams.set(
                                          "page",
                                          currentPage.toString()
                                        );
                                        setSearchParams(searchParams);
                                      }}
                                      disabled={loading}
                                    >
                                      {currentPage + 1}
                                    </button>
                                  )}

                                {totalPages > 3 && (
                                  <button
                                    className={`btn btn-sm px-2 sm:px-3 ${
                                      currentPage === totalPages
                                        ? "border-amber-400"
                                        : "btn-ghost"
                                    }`}
                                    onClick={() => {
                                      searchParams.set(
                                        "page",
                                        totalPages.toString()
                                      );
                                      setSearchParams(searchParams);
                                      setCurrentPage(totalPages);
                                    }}
                                    disabled={loading}
                                  >
                                    {totalPages}
                                  </button>
                                )}

                                <button
                                  className="btn btn-sm btn-ghost px-2 sm:px-3"
                                  onClick={() => {
                                    const newPage = currentPage + 1;
                                    searchParams.set(
                                      "page",
                                      newPage.toString()
                                    );
                                    setSearchParams(searchParams);
                                    setCurrentPage(newPage);
                                  }}
                                  disabled={
                                    loading || currentPage === totalPages
                                  }
                                  title="Next Page"
                                >
                                  →
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8 sm:py-12">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-base-300 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg
                                className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-base-content/40"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                ></path>
                              </svg>
                            </div>
                            <p className="text-sm sm:text-base lg:text-lg text-base-content/60">
                              No published posts found.
                            </p>
                            <p className="text-xs sm:text-sm text-base-content/40 mt-2">
                              {searchParams.has("searchText") ||
                              searchParams.has("topic") ||
                              searchParams.has("selectedDate") ||
                              searchParams.has("commentSort") ||
                              searchParams.has("dateSort")
                                ? "Try adjusting your filters to see more posts."
                                : "Start creating content to see your published posts here!"}
                            </p>
                            {(searchParams.has("searchText") ||
                              searchParams.has("topic") ||
                              searchParams.has("selectedDate") ||
                              searchParams.has("commentSort") ||
                              searchParams.has("dateSort")) && (
                              <button
                                onClick={clearFilters}
                                className="mt-4 cursor-pointer px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 text-sm font-medium"
                              >
                                Clear Filters
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "pending" && (
                      <div>
                        {pendingPosts.length > 0 ? (
                          <>
                            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
                              {paginatedPendingPosts.map((post) => (
                                <div
                                  key={post.id}
                                  className="card bg-base-200 shadow-lg transition-all duration-300 border border-warning/20 relative overflow-hidden h-full flex flex-col"
                                >
                                  <button
                                    className="absolute top-1 right-1 p-1 cursor-pointer rounded-full hover:bg-base-300 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      showModal(
                                        `Are you sure you want to remove post with title '${post.title}' from review? This action cannot be undone.`,
                                        "confirmRemoval",
                                        post.id
                                      );
                                    }}
                                  >
                                    <img
                                      src={trashIcon}
                                      alt="Delete"
                                      className="w-3 h-3 sm:w-4 sm:h-4"
                                    />
                                  </button>
                                  <div className="absolute top-0 left-0 w-full h-1"></div>

                                  <div className="card-body p-3 sm:p-4 lg:p-6 flex flex-col h-full">
                                    <h3 className=" text-sm sm:text-base lg:text-lg mb-2 sm:mb-3 text-base-content break-words min-w-0">
                                      {post.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-base-content/70 mt-2 line-clamp-3 flex-grow">
                                      {post.content}
                                    </p>

                                    <div className="flex items-center text-xs sm:text-sm text-base-content/60 mb-3 sm:mb-4 mt-2">
                                      <svg
                                        className="w-3 h-3 sm:w-4 sm:h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        ></path>
                                      </svg>
                                      Submitted{" "}
                                      {new Date(
                                        post.created_at
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </div>

                                    <div className="card-actions justify-end mt-auto">
                                      <div className="flex items-center space-x-2">
                                        <div className="flex items-center text-xs text-warning">
                                          <div className="w-2 h-2 sm:w-3 sm:h-3 mr-1.5 bg-warning rounded-full animate-pulse"></div>
                                          Under Review
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {pendingTotalPages >= 1 && (
                              <div className="md:col-span-2 xl:col-span-3 flex justify-center items-center gap-1 sm:gap-2 mt-6 sm:mt-8">
                                <button
                                  className="btn btn-sm btn-ghost px-2 sm:px-3"
                                  onClick={() =>
                                    handlePendingPageChange(
                                      pendingCurrentPage - 1
                                    )
                                  }
                                  disabled={pendingCurrentPage === 1}
                                  title="Previous Page"
                                >
                                  ←
                                </button>
                                {Array.from(
                                  { length: Math.min(3, pendingTotalPages) },
                                  (_, idx) => (
                                    <button
                                      key={idx}
                                      className={`btn btn-sm px-2 sm:px-3 ${
                                        pendingCurrentPage === idx + 1
                                          ? "border-amber-400"
                                          : "btn-ghost"
                                      }`}
                                      onClick={() =>
                                        handlePendingPageChange(idx + 1)
                                      }
                                    >
                                      {idx + 1}
                                    </button>
                                  )
                                )}
                                {pendingTotalPages > 3 && (
                                  <span className="px-1 sm:px-2 text-gray-500 text-sm">
                                    ...
                                  </span>
                                )}
                                {pendingCurrentPage > 2 &&
                                  pendingCurrentPage <
                                    pendingTotalPages - 1 && (
                                    <button
                                      className="btn btn-sm border-amber-400 px-2 sm:px-3"
                                      onClick={() =>
                                        handlePendingPageChange(
                                          pendingCurrentPage
                                        )
                                      }
                                    >
                                      {pendingCurrentPage}
                                    </button>
                                  )}

                                {pendingTotalPages > 3 && (
                                  <button
                                    className={`btn btn-sm px-2 sm:px-3 ${
                                      pendingCurrentPage === pendingTotalPages
                                        ? "border-amber-400"
                                        : "btn-ghost"
                                    }`}
                                    onClick={() =>
                                      handlePendingPageChange(pendingTotalPages)
                                    }
                                  >
                                    {pendingTotalPages}
                                  </button>
                                )}
                                <button
                                  className="btn btn-sm btn-ghost px-2 sm:px-3"
                                  onClick={() =>
                                    handlePendingPageChange(
                                      pendingCurrentPage + 1
                                    )
                                  }
                                  disabled={
                                    pendingCurrentPage === pendingTotalPages
                                  }
                                  title="Next Page"
                                >
                                  →
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-8 sm:py-12">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg
                                className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-success"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                ></path>
                              </svg>
                            </div>
                            <p className="text-sm sm:text-base lg:text-lg text-base-content/60">
                              All clear! No posts waiting for review.
                            </p>
                            <p className="text-xs sm:text-sm text-base-content/40 mt-2">
                              Your submissions will appear here while awaiting
                              approval.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {modal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm p-4"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-base-200 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              {(modal.type === "confirm" ||
                modal.type === "confirmRemoval") && (
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
              {modal.type === "error" && (
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
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </div>
              )}
              <h3 className="font-bold text-base sm:text-lg" id="modal-title">
                {modal.type === "confirm"
                  ? "Delete Post"
                  : modal.type === "success"
                  ? "Success"
                  : modal.type === "confirmRemoval"
                  ? "Remove Post"
                  : "Error"}
              </h3>
            </div>
            <p className="py-3 sm:py-4 text-sm sm:text-base break-words">
              {modal.message}
            </p>
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
              ) : modal.type === "confirmRemoval" ? (
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
                    onClick={confirmRemoval}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <span className="loading loading-spinner loading-sm mr-2"></span>
                        Removing...
                      </>
                    ) : (
                      "Remove"
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

export default UserPosts;
