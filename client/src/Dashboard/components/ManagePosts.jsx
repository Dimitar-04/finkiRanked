import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import doneAll from '../../assets/images/done-all.svg';
import trashIcon from '../../assets/images/delete.svg';
import { useAuth } from '@/contexts/AuthContext';
import {
  getReviewPosts,
  deleteReviewPost,
  approveReviewPost,
} from '@/services/reviewService';
import CalendarPopover from './CalendarPopover';
import 'react-datepicker/dist/react-datepicker.css';
import 'cally';
const ManagePosts = () => {
  const [posts, setPosts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [error, setError] = useState(null);
  const postsPerPage = 10;

  const { user, loading: authLoading } = useAuth();
  const [modal, setModal] = useState({
    isOpen: false,
    message: '',
    type: '',
    postId: null,
    post: null,
  });
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Filter states
  const defaultFilters = {
    topic: 'all',
    dateSort: 'newest',
    selectedDate: null,
    searchText: '',
  };

  const [filters, setFilters] = useState(() => {
    const initialFilters = { ...defaultFilters };
    for (const [key, value] of searchParams.entries()) {
      if (key in initialFilters) {
        initialFilters[key] = value;
      }
    }
    return initialFilters;
  });

  const [showFilters, setShowFilters] = useState(false);

  const applyFilters = () => {
    const newSearchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(filters)) {
      if (value && value.toString() !== defaultFilters[key]?.toString()) {
        newSearchParams.set(key, value);
      }
    }
    newSearchParams.set('page', '1');
    setPage(1);
    setSearchParams(newSearchParams);
  };
  const handleRemoveFilter = (filterKey) => {
    const newFilters = { ...filters, [filterKey]: defaultFilters[filterKey] };
    setFilters(newFilters);

    if (searchParams.has(filterKey)) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete(filterKey);
      setPage(1);
      newSearchParams.set('page', '1');
      setSearchParams(newSearchParams);
    }
  };
  const clearFilters = () => {
    const freshDefaultFilters = { ...defaultFilters };
    setFilters(freshDefaultFilters);
    setSearchParams({ page: '1' });
    setPage(1);
  };
  const activeFilters = { ...defaultFilters };
  for (const [key, value] of searchParams.entries()) {
    if (key in activeFilters) {
      activeFilters[key] = value;
    }
  }

  const showModal = (message, type, postId = null, post = null) => {
    setModal({ isOpen: true, message, type, postId, post });
  };

  const openViewPostModal = (post) => {
    showModal('', 'view-post', post.id, post);
  };
  const closeModal = () => {
    setModal({
      isOpen: false,
      message: '',
      type: '',
      postId: null,
      post: null,
    });
  };

  const confirmAction = async () => {
    setIsActionLoading(true);
    if (modal.type === 'delete' && modal.postId) {
      await handleDeletePost(modal.postId);
    } else if (modal.type === 'approve' && modal.post) {
      await handleApprovePost(modal.post);
    }
    setIsActionLoading(false);
  };

  useEffect(() => {
    const fetchPostsData = async () => {
      if (authLoading || !user?.id) return;

      setIsFetching(true);
      setError(null);

      const filtersForApi = {
        searchText: searchParams.get('searchText') || '',
        topic: searchParams.get('topic') || 'all',
        selectedDate: searchParams.get('selectedDate') || null,
        dateSort: searchParams.get('dateSort') || 'newest',
      };

      try {
        const currentPage = parseInt(searchParams.get('page') || '1', 10);
        setPage(currentPage);

        const data = await getReviewPosts(
          currentPage - 1,
          postsPerPage,
          user.id,
          filtersForApi
        );

        setPosts(data.posts);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error('Error fetching review posts:', err);
        setPosts([]);
        setTotalPages(0);
        setError(
          err.response?.data?.error ||
            'Failed to fetch posts. You may not have permission.'
        );
      } finally {
        setIsFetching(false);
      }
    };

    fetchPostsData();
  }, [user?.id, authLoading, searchParams]);

  const handleDeletePost = async (postId) => {
    try {
      await deleteReviewPost(postId, user.id);
      setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
      showModal('Post deleted successfully.', 'deleted');
    } catch (err) {
      console.error('Error deleting review post:', err);
      setError(
        err.response?.data?.message || err.message || 'Failed to delete post.'
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
      setPosts((prevPosts) =>
        prevPosts.filter((p) => p.id !== postToApprove.id)
      );
      showModal('Post approved successfully.', 'success');
    } catch (err) {
      console.error('Error approving post:', err);
      setError(
        err.response?.data?.message || err.message || 'Failed to approve post.'
      );
      showModal(
        err.response?.data?.message || err.message || 'Failed to approve post.',
        'error'
      );
    }
  };

  const openConfirmationModal = (type, item) => {
    if (type === 'delete') {
      showModal(
        `Are you sure you want to delete post with title "${item.title}"? This action cannot be undone.`,
        'delete',
        item.id,
        item
      );
    } else if (type === 'approve') {
      showModal(
        `Are you sure you want to approve post with title "${item.title}"? It will be published to the forum.`,
        'approve',
        item.id,
        item
      );
    }
  };

  const isLoading = authLoading || isFetching;

  return (
    <div
      data-theme="luxury"
      className="dashboard min-h-screen flex bg-base-100"
    >
      <div className="flex flex-col w-full  ">
        {/* Filter System */}
        <div className="sticky top-0 z-20 bg-base-100">
          <div className="flex flex-col">
            {/* Sticky Header Section */}

            {/* Filter Navbar */}
            <div className="border-b border-base-300 shadow-sm">
              <div className="p-3 sm:p-4 md:pl-12 w-full max-w-full mx-auto">
                {/* Mobile Filter Toggle */}
                <div className="flex items-center justify-between mb-3 lg:hidden ">
                  <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    Filters
                    {/* Active filter count indicator */}
                    {(filters.topic !== 'all' ||
                      filters.dateSort !== 'newest' ||
                      filters.selectedDate ||
                      (filters.searchText && filters.searchText.trim())) && (
                      <span className="badge badge-sm bg-yellow-500 text-black border-none">
                        {
                          [
                            filters.topic !== 'all',
                            filters.dateSort !== 'newest',
                            filters.selectedDate,
                            filters.commentSort !== 'none',
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
                        showFilters ? 'rotate-180' : ''
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
                    showFilters ? 'block opacity-100' : 'hidden opacity-0'
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
                          placeholder="Search titles and content..."
                          value={filters.searchText}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              searchText: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
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
                          <option value="oldest">Oldest First</option>
                        </select>
                      </div>
                    </div>

                    {/* Mobile: Single column for date picker and popularity */}
                    <div className="space-y-2 lg:space-y-0 lg:contents">
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
                                  ).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : '' // Use empty string so placeholder is visible
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
                        {(filters.topic !== 'all' ||
                          filters.dateSort !== 'newest' ||
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
                    {filters.topic !== 'all' && (
                      <span className="badge badge-outline badge-sm flex items-center gap-1 px-2 py-1">
                        <span className="font-medium text-xs">
                          {filters.topic === 'general'
                            ? 'General'
                            : 'Daily Challenge'}
                        </span>
                        <button
                          type="button"
                          className="ml-1 text-xs font-bold hover:text-error hover:cursor-pointer focus:outline-none"
                          onClick={() => handleRemoveFilter('topic')}
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
                          onClick={() => handleRemoveFilter('searchText')}
                          aria-label="Remove search filter"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.dateSort !== 'newest' && (
                      <span className="badge badge-outline badge-sm flex items-center gap-1 px-2 py-1">
                        <span className="font-medium text-xs">
                          {filters.dateSort === 'oldest'
                            ? 'Oldest First'
                            : 'Most Recent'}
                        </span>
                        <button
                          type="button"
                          className="ml-1 text-xs font-bold hover:text-error hover:cursor-pointer focus:outline-none"
                          onClick={() => handleRemoveFilter('dateSort')}
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
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            }
                          )}
                        </span>
                        <button
                          type="button"
                          className="ml-1 text-xs font-bold hover:text-error hover:cursor-pointer focus:outline-none"
                          onClick={() => handleRemoveFilter('selectedDate')}
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
            <p className="text-base sm:text-lg text-base-content/60">
              No posts found matching your criteria.
            </p>
            <p className="text-xs sm:text-sm text-base-content/40 mt-2">
              {activeFilters.searchText ||
              activeFilters.topic !== 'all' ||
              activeFilters.selectedDate
                ? 'Try adjusting your filters to see more posts.'
                : 'No posts are currently awaiting review.'}
            </p>
            {(activeFilters.searchText ||
              activeFilters.topic !== 'all' ||
              activeFilters.selectedDate) && (
              <button
                onClick={clearFilters}
                className="mt-4 cursor-pointer px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 text-sm font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {!isLoading && (
          <div className=" grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 md:p-6 md:pl-12 w-full">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-4 sm:p-6 border border-base-300 bg-base-200 rounded-lg shadow-sm hover:shadow-md transition relative w-full"
              >
                <h1
                  className="text-lg text-sm sm:text-xl lg:text-2xl font-bold mb-4 pr-16 sm:pr-20 cursor-pointer"
                  onClick={() => openViewPostModal(post)}
                >
                  {post.title}
                </h1>
                <div className="absolute gap-3 top-3 sm:top-4 right-3 sm:right-4 flex gap-1 sm:gap-2">
                  <button
                    title="Approve Post"
                    className="btn btn-xs sm:btn-sm btn-success btn-circle"
                    onClick={() => openConfirmationModal('approve', post)}
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
                    onClick={() => openConfirmationModal('delete', post)}
                  >
                    <img
                      src={trashIcon}
                      alt="Delete"
                      className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5"
                    />
                  </button>
                </div>

                {/* Topic Badge */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                  <span
                    className={`inline-block text-xs font-semibold px-1.5 py-0.5 rounded ${
                      post.topic === 'general'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {post.topic === 'general' ? 'General' : 'Daily Challenge'}
                  </span>
                  {post.challengeTitle && (
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-1.5 py-0.5 rounded">
                      {post.challengeTitle}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-base-content/70 mb-2 sm:mb-6">
                  By {post.author_name}
                  <span className="mx-1">·</span>
                  <span className="italic">
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </p>
                <p className="text-sm sm:text-base text-base-content/90 whitespace-pre-line break-words">
                  {post.content && post.content.length > 60
                    ? post.content.slice(0, 60) + '...'
                    : post.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {!isLoading && posts.length > 0 && totalPages >= 1 && (
          <div className="flex justify-center items-center gap-1 sm:gap-2 mt-6 mb-6 sm:mt-8">
            <button
              className="btn btn-sm btn-ghost px-2 sm:px-3"
              onClick={() => {
                const newPage = page - 1;
                searchParams.set('page', newPage.toString());
                setSearchParams(searchParams);
              }}
              disabled={isLoading || page === 1}
              title="Previous Page"
            >
              ←
            </button>

            {Array.from({ length: Math.min(3, totalPages) }, (_, idx) => (
              <button
                key={idx}
                className={`btn btn-sm px-2 sm:px-3 ${
                  page - 1 === idx ? 'border-amber-400' : 'btn-ghost'
                }`}
                onClick={() => {
                  searchParams.set('page', (idx + 1).toString());
                  setSearchParams(searchParams);
                }}
                disabled={isLoading}
              >
                {idx + 1}
              </button>
            ))}

            {totalPages > 3 && (
              <span className="px-1 sm:px-2 text-gray-500 text-sm">...</span>
            )}

            {page > 2 && page < totalPages - 1 && (
              <button
                className="btn btn-sm border-amber-400 px-2 sm:px-3"
                onClick={() => {
                  searchParams.set('page', page.toString());
                  setSearchParams(searchParams);
                }}
                disabled={isLoading}
              >
                {page + 1}
              </button>
            )}

            {totalPages > 3 && (
              <button
                className={`btn btn-sm px-2 sm:px-3 ${
                  page === totalPages ? 'border-amber-400' : 'btn-ghost'
                }`}
                onClick={() => {
                  searchParams.set('page', totalPages.toString());
                  setSearchParams(searchParams);
                }}
                disabled={isLoading}
              >
                {totalPages}
              </button>
            )}

            <button
              className="btn btn-sm btn-ghost px-2 sm:px-3"
              onClick={() => {
                const newPage = page + 1;
                searchParams.set('page', newPage.toString());
                setSearchParams(searchParams);
              }}
              disabled={isLoading || page === totalPages}
              title="Next Page"
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* Modal element */}
      {modal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-xs p-4"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-base-200 rounded-lg shadow-xl p-4 sm:p-6  w-full max-w-xl sm:max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              {(modal.type === 'approve' || modal.type === 'success') && (
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
              {(modal.type === 'delete' ||
                modal.type === 'deleted' ||
                modal.type === 'error') && (
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
                {modal.type === 'approve' && 'Approve Post'}
                {(modal.type === 'deleted' || modal.type === 'delete') &&
                  'Delete Post'}
                {(modal.type === 'success' || modal.type === 'error') &&
                  'Approve Post'}
              </h3>
            </div>
            {modal.type === 'view-post' && modal.post ? (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <h3
                  className="font-bold text-xl sm:text-2xl text-base-content"
                  id="modal-title"
                >
                  {modal.post.title}
                </h3>
                <p className="text-sm text-base-content/70">
                  By {modal.post.author_name}
                  <span className="mx-1.5">·</span>
                  <span className="italic">
                    {new Date(modal.post.created_at).toLocaleDateString(
                      'en-US',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </span>
                </p>
                <div className="text-base text-base-content/90 whitespace-pre-line break-words pt-4 border-t border-base-300">
                  {modal.post.content}
                </div>
              </div>
            ) : (
              <div className="flex py-3 sm:py-4 items-center gap-3">
                <p>{modal.message}</p>
              </div>
            )}
            <div className="flex justify-end gap-2 sm:gap-3 mt-3 sm:mt-4">
              {modal.type === 'approve' || modal.type === 'delete' ? (
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
                      modal.type === 'approve' ? 'btn-success' : 'btn-error'
                    }`}
                    onClick={confirmAction}
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm mr-2"></span>
                        {modal.type === 'approve'
                          ? 'Approving...'
                          : 'Deleting...'}
                      </>
                    ) : modal.type === 'approve' ? (
                      'Approve'
                    ) : (
                      'Delete'
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
