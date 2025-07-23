import { useAuth } from "../../contexts/AuthContext.jsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPendingPosts } from "@/services/reviewService";
import { getAllPostsByUser } from "@/services/forumService.js";
import commentIcon from "../../assets/images/comment.svg";
import { DatePicker } from "react-daisyui-timetools";
import "react-datepicker/dist/react-datepicker.css";

const UserPosts = () => {
  const { user } = useAuth();
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("published");
  const navigate = useNavigate();

  // Filter states
  const defaultFilters = {
    topic: "all", // "all", "general", "daily-challenge"
    dateSort: "newest", // "newest", "oldest"
    selectedDate: null, // specific date filter
    commentSort: "none", // "none", "most-popular", "least-popular"
    searchText: "", // text search in title and content
  };

  const [filters, setFilters] = useState({ ...defaultFilters });
  const [appliedFilters, setAppliedFilters] = useState({ ...defaultFilters });
  const [showFilters, setShowFilters] = useState(false);

  // Apply filters to posts
  const applyFiltersToApprovedPosts = (posts, activeFilters) => {
    let filteredPosts = [...posts];

    // 1. Apply text search filter
    if (activeFilters.searchText && activeFilters.searchText.trim()) {
      const searchTerm = activeFilters.searchText.trim().toLowerCase();
      filteredPosts = filteredPosts.filter((post) => {
        const titleMatch =
          post.title && post.title.toLowerCase().includes(searchTerm);
        const contentMatch =
          post.content && post.content.toLowerCase().includes(searchTerm);
        return titleMatch || contentMatch;
      });
    }

    // 2. Apply topic filter
    if (activeFilters.topic && activeFilters.topic !== "all") {
      filteredPosts = filteredPosts.filter(
        (post) => post.topic === activeFilters.topic
      );
    }

    // 3. Apply specific date filter
    if (activeFilters.selectedDate) {
      try {
        const filterDate =
          activeFilters.selectedDate instanceof Date
            ? new Date(activeFilters.selectedDate)
            : new Date(String(activeFilters.selectedDate));

        if (!isNaN(filterDate.getTime())) {
          filterDate.setHours(0, 0, 0, 0);
          const nextDay = new Date(filterDate);
          nextDay.setDate(nextDay.getDate() + 1);

          filteredPosts = filteredPosts.filter((post) => {
            const postDate = new Date(post.date_created);
            return postDate >= filterDate && postDate < nextDay;
          });
        }
      } catch (err) {
        console.error("Error in date filtering:", err);
      }
    }

    // 4. Apply comment popularity sorting
    if (activeFilters.commentSort && activeFilters.commentSort !== "none") {
      filteredPosts = filteredPosts.sort((a, b) => {
        if (activeFilters.commentSort === "most-popular") {
          return (
            b.comment_count - a.comment_count ||
            new Date(b.date_created) - new Date(a.date_created)
          );
        } else {
          return (
            a.comment_count - b.comment_count ||
            new Date(b.date_created) - new Date(a.date_created)
          );
        }
      });
    }
    // 5. Apply date sorting (if comment sorting wasn't applied)
    else if (activeFilters.dateSort) {
      filteredPosts = filteredPosts.sort((a, b) => {
        const dateA = new Date(a.date_created);
        const dateB = new Date(b.date_created);

        if (activeFilters.dateSort === "oldest") {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });
    }

    return filteredPosts;
  };

  // Apply all selected filters
  const applyFilters = () => {
    console.log("Applying filters:", filters);
    const currentFilters = { ...filters };
    setAppliedFilters(currentFilters);
  };

  // Clear all filters and reset to default
  const clearFilters = () => {
    console.log("Clearing filters, using defaults:", defaultFilters);
    const freshDefaultFilters = { ...defaultFilters };
    setFilters(freshDefaultFilters);
    setAppliedFilters(freshDefaultFilters);
  };
  useEffect(() => {
    if (user) {
      const fetchAllPosts = async () => {
        try {
          setLoading(true);

          const [approvedData, pendingData] = await Promise.all([
            getAllPostsByUser(),
            getPendingPosts(),
          ]);

          setApprovedPosts(approvedData);
          console.log(approvedData);
          setPendingPosts(pendingData);
        } catch (error) {
          console.error("Error fetching user posts:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchAllPosts();
    }
  }, [user?.id]);

  // Apply filters to get filtered posts
  const filteredApprovedPosts = applyFiltersToApprovedPosts(
    approvedPosts,
    appliedFilters
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div data-theme="luxury" className="min-h-screen bg-base-100">
      <div className="flex flex-col h-screen">
        {/* Sticky Header Section */}
        <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 shadow-sm">
          <div className="p-4 sm:p-6 sm:pl-12 w-full">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center lg:text-left">
                Your Posts
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
                    navigate("/dashboard/forum");
                  }}
                  className="cursor-pointer px-4 py-2 sm:px-6 sm:py-3 bg-yellow-500 text-black rounded hover:bg-yellow-600 text-sm sm:text-base font-medium w-full lg:w-auto lg:whitespace-nowrap"
                >
                  View Forum
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="sticky top-[73px] z-10 bg-base-200 border-b border-base-300 shadow-sm">
          <div className="p-3 sm:p-4 sm:pl-12 w-full max-w-full mx-auto">
            <div className="flex justify-center mb-4">
              <div className="rounded-lg bg-base-300 p-1 flex gap-2 w-full max-w-md sm:w-auto">
                <button
                  className={`tab tab-sm sm:tab-md lg:tab-lg rounded-lg flex-1 sm:flex-initial ${
                    activeTab === "published"
                      ? "tab-active bg-[#FFB800] text-black hover:text-black"
                      : "hover:bg-base-200"
                  }`}
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
                    Published ({filteredApprovedPosts.length})
                  </span>
                </button>
                <button
                  className={`tab tab-sm sm:tab-md lg:tab-lg rounded-lg flex-1 sm:flex-initial ${
                    activeTab === "pending"
                      ? "tab-active bg-[#FFB800] text-black hover:text-black"
                      : "hover:bg-base-200"
                  }`}
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
            </div>

            {/* Filters only show for published tab */}
            {activeTab === "published" && (
              <>
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
                        className="select select-sm select-bordered w-full text-sm"
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
                      <DatePicker
                        className="input input-sm input-bordered w-full text-sm"
                        selected={
                          filters.selectedDate instanceof Date
                            ? filters.selectedDate
                            : filters.selectedDate
                            ? new Date(filters.selectedDate)
                            : null
                        }
                        onChange={(date) => {
                          if (date) {
                            try {
                              const validDate = new Date(date);
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
                            setFilters({ ...filters, selectedDate: null });
                          }
                        }}
                        placeholder="Select date"
                        maxDate={new Date()}
                        dateFormat="MM/dd/yyyy"
                        showYearDropdown
                        showMonthDropdown
                        isClearable={true}
                      />
                    </div>

                    {/* Comment Sort */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Popularity
                      </label>
                      <select
                        value={filters.commentSort}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            commentSort: e.target.value,
                          })
                        }
                        className="select select-sm select-bordered w-full text-sm"
                      >
                        <option value="none">No Sorting</option>
                        <option value="most-popular">Most Popular</option>
                        <option value="least-popular">Least Popular</option>
                      </select>
                    </div>

                    {/* Clear Filters & Apply Buttons */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide opacity-0">
                        Actions
                      </label>
                      <div className="flex gap-1">
                        <button
                          onClick={clearFilters}
                          className="cursor-pointer px-2 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs font-medium w-16"
                        >
                          Clear
                        </button>
                        <button
                          onClick={applyFilters}
                          className="cursor-pointer px-2 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 text-xs font-medium w-16"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  <div className="flex flex-wrap gap-2">
                    {filters.topic !== "all" && (
                      <span className="badge badge-outline badge-sm">
                        Topic:{" "}
                        {filters.topic === "general"
                          ? "General"
                          : "Daily Challenge"}
                      </span>
                    )}
                    {filters.searchText && filters.searchText.trim() && (
                      <span className="badge badge-outline badge-sm">
                        Search: "{filters.searchText.trim()}"
                      </span>
                    )}
                    {filters.dateSort !== "newest" && (
                      <span className="badge badge-outline badge-sm">
                        Sort:{" "}
                        {filters.dateSort === "oldest"
                          ? "Oldest First"
                          : "Most Recent"}
                      </span>
                    )}
                    {filters.selectedDate && (
                      <span className="badge badge-outline badge-sm">
                        Date:{" "}
                        {filters.selectedDate instanceof Date
                          ? filters.selectedDate.toLocaleDateString()
                          : new Date(filters.selectedDate).toLocaleDateString()}
                      </span>
                    )}
                    {filters.commentSort !== "none" && (
                      <span className="badge badge-outline badge-sm">
                        {filters.commentSort === "most-popular"
                          ? "Most Popular"
                          : "Least Popular"}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <span className="loading loading-spinner loading-md sm:loading-lg"></span>
            </div>
          ) : (
            <div className="h-full">
              <div className="overflow-y-auto">
                <div className="p-4 sm:p-6 sm:pl-12 w-full">
                  {/* Tab Content */}
                  <div className="animate-fadeIn">
                    {activeTab === "published" && (
                      <div>
                        <div className="flex items-center mb-4 sm:mb-6">
                          <div className="w-1 h-6 sm:h-8 bg-success rounded-full mr-2 sm:mr-4"></div>
                          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-base-content">
                            Your Published Posts
                          </h2>
                          <div className="flex-1 h-px bg-gradient-to-r from-[#FFB800]/30 to-transparent ml-2 sm:ml-4"></div>
                        </div>

                        {filteredApprovedPosts.length > 0 ? (
                          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {filteredApprovedPosts.map((post) => (
                              <div
                                key={post.id}
                                className="card bg-base-200 shadow-lg hover:shadow-xl transition-all duration-300 border h-full flex flex-col"
                              >
                                <div className="card-body p-3 sm:p-4 lg:p-6 flex flex-col h-full">
                                  <div className="flex">
                                    <h3
                                      className="card-title text-sm sm:text-base lg:text-lg mb-2 sm:mb-3 text-base-content line-clamp-2 hover:underline cursor-pointer flex-grow"
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
                                  <div className="mb-2">
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
                              {appliedFilters.searchText ||
                              appliedFilters.topic !== "all" ||
                              appliedFilters.selectedDate ||
                              appliedFilters.commentSort !== "none"
                                ? "Try adjusting your filters to see more posts."
                                : "Start creating content to see your published posts here!"}
                            </p>
                            {(appliedFilters.searchText ||
                              appliedFilters.topic !== "all" ||
                              appliedFilters.selectedDate ||
                              appliedFilters.commentSort !== "none") && (
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
                        <div className="flex items-center mb-4 sm:mb-6">
                          <div className="w-1 h-6 sm:h-8 bg-warning rounded-full mr-2 sm:mr-4"></div>
                          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-base-content">
                            Awaiting Approval
                          </h2>
                          <div className="flex-1 h-px bg-gradient-to-r from-[#FFB800]/30 to-transparent ml-2 sm:ml-4"></div>
                        </div>

                        {pendingPosts.length > 0 ? (
                          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {pendingPosts.map((post) => (
                              <div
                                key={post.id}
                                className="card bg-base-200 shadow-lg transition-all duration-300 border border-warning/20 relative overflow-hidden h-full flex flex-col"
                              >
                                <div className="absolute top-0 left-0 w-full h-1"></div>

                                <div className="card-body p-3 sm:p-4 lg:p-6 flex flex-col h-full">
                                  <h3 className="card-title text-sm sm:text-base lg:text-lg mb-2 sm:mb-3 text-base-content line-clamp-2">
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
    </div>
  );
};

export default UserPosts;
