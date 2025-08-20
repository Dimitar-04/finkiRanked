import React, { useEffect, useRef, useState } from 'react';
import {
  getChallenges,
  deleteTask,
  searchTaskByDate,
} from '@/services/taskService';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CalendarPopover from './CalendarPopover';
import 'cally';
const PAGE_SIZE = 10;

const ManageChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [expandedChallenge, setExpandedChallenge] = useState(null);
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const calendarRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const defaultFilters = {
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
  const [modal, setModal] = useState({
    isOpen: false,
    message: '',
    type: '',
    challengeId: null,
  });
  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      const dateParam = searchParams.get('date');

      try {
        const data = await getChallenges(currentPage, PAGE_SIZE, filters);
        setChallenges(data.challenges);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error('Failed to fetch challenges:', err);
        setChallenges([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [currentPage, searchParams]);
  const fetchTestCases = async (challengeId) => {
    try {
      setExpandedChallenge(
        expandedChallenge === challengeId ? null : challengeId
      );
    } catch (err) {
      console.error(
        `Failed to fetch test cases for challenge ${challengeId}:`,
        err
      );
    }
  };
  const applyFilters = () => {
    const newSearchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value && value.toString() !== defaultFilters[key]?.toString()) {
        newSearchParams.set(key, value);
      }
    }
    newSearchParams.set('page', '1');
    setCurrentPage(1);
    setSearchParams(newSearchParams);
  };
  const handleRemoveFilter = (filterKey) => {
    const newFilters = { ...filters, [filterKey]: defaultFilters[filterKey] };
    setFilters(newFilters);

    if (searchParams.has(filterKey)) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete(filterKey);
      setCurrentPage(1);
      newSearchParams.set('page', '1');
      setSearchParams(newSearchParams);
    }
  };

  const clearFilters = () => {
    const freshDefaultFilters = { ...defaultFilters };
    setFilters(freshDefaultFilters);
    setSearchParams({ page: '1' });
    setCurrentPage(1);
  };

  const handleViewAll = async () => {
    clearFilters();
  };

  const deleteChallenge = async (challengeId) => {
    try {
      setLoading(true);
      console.log(challengeId);
      await deleteTask(challengeId);
      setChallenges(
        challenges.filter((challenge) => challenge.id !== challengeId)
      );
      showModal('Challenge deleted successfully.', 'success');
    } catch (err) {
      showModal(`Failed to delete challenge: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (message, type = 'info', challengeId = null) => {
    setModal({ isOpen: true, message, type, challengeId });
  };

  const closeModal = () => {
    setModal({ isOpen: false, message: '', type: '', challengeId: null });
  };

  const confirmDelete = async () => {
    if (modal.challengeId) {
      setLoading(true);
      await deleteChallenge(modal.challengeId);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="sticky top-0 z-20 bg-base-100 ">
        <div className="flex flex-col">
          <div className="hidden sm:w-full sm:flex sm:justify-end sm:pt-3 sm:pr-3 ">
            <button
              className="btn btn-outline btn-sm border-amber-400 gap-2"
              onClick={() => {
                navigate('/dashboard/create-new-challenge', {
                  state: {
                    manageChallengesSearchParams: searchParams.toString(),
                  },
                });
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add New Challenge
            </button>
          </div>
          <div className="border-b border-base-300 shadow-sm">
            <div className="p-3 sm:p-4 md:pl-12 w-full max-w-full mx-auto">
              {/* Mobile  */}
              <div className="flex items-center justify-between mb-3 lg:hidden">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  Filters
                  {(filters.dateSort !== 'newest' ||
                    filters.selectedDate ||
                    (filters.searchText && filters.searchText.trim())) && (
                    <span className="badge badge-sm bg-yellow-500 text-black border-none">
                      {
                        [
                          filters.dateSort !== 'newest',
                          filters.selectedDate,
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

              <div
                className={`transition-all duration-300 ${
                  showFilters ? 'block opacity-100' : 'hidden opacity-0'
                } lg:block lg:opacity-100`}
              >
                <div className="space-y-2 lg:space-y-0 lg:grid lg:grid-cols-6 xl:grid-cols-8 lg:gap-2 mb-2 max-w-full">
                  <div className="flex flex-col gap-1 lg:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Search Challenges
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

                  <div className="flex flex-col gap-1 lg:col-span-2 xl:col-span-2">
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

                  <div className="relative flex flex-col gap-1 lg:col-span-2 xl:col-span-2">
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
                            ? new Date(filters.selectedDate).toLocaleDateString(
                                'en-US',
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )
                            : ''
                        }
                        placeholder="Select date"
                        className="input input-sm input-bordered w-full text-xs pl-8 pr-2 cursor-pointer h-8"
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
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
                      isFromManageChallenges={true}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-1 lg:col-span-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide opacity-0">
                      Actions
                    </label>
                    <div className="flex gap-1.5">
                      {(filters.dateSort !== 'newest' ||
                        filters.selectedDate ||
                        (filters.searchText && filters.searchText.trim())) && (
                        <button
                          onClick={clearFilters}
                          className="cursor-pointer px-2 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-xs font-medium transition-colors duration-200 flex-1 lg:flex-none h-8"
                        >
                          <span className="lg:hidden">Clea Filters</span>
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
                        <span className="hidden lg:inline">Apply Filters</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 sm:gap-2">
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

      <div className="p-3 sm:p-4 md:p-6 md:pl-12 w-full">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : challenges.length > 0 ? (
          <div className="space-y-6">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="card bg-base-200 shadow-md">
                <div className="card-body">
                  <div className="flex justify-between items-center">
                    <h2 className="card-title text-xl font-bold">
                      {challenge.title
                        .split('-')
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(' ')}
                    </h2>
                    <div className="badge badge-tertiary p-4">
                      {new Date(challenge.solving_date).toLocaleDateString()}
                    </div>
                  </div>

                  <p className="text-base-content/80 mt-2 line-clamp-2">
                    {challenge.content}
                  </p>

                  {challenge.examples && challenge.examples.length > 0 && (
                    <div className="mt-4 card bg-base-300 p-3">
                      <h3 className="font-medium mb-2">Examples:</h3>
                      <div className="space-y-3">
                        {challenge.examples.map((example, index) => (
                          <div key={index} className="font-mono text-sm">
                            <p className="pl-2 border-l-2 border-amber-400 mt-1">
                              Input: "{example.input || 'N/A'}" <br />
                              Output: "{example.output || 'N/A'}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="card-actions justify-between mt-4">
                    <button
                      className="btn btn-sm btn-teritary"
                      onClick={() => fetchTestCases(challenge.id)}
                    >
                      {expandedChallenge === challenge.id
                        ? 'Hide Test Cases'
                        : 'Show Test Cases'}
                    </button>

                    <button
                      className="btn btn-sm btn-error btn-outline"
                      onClick={() =>
                        showModal(
                          `Are you sure you want to delete challenge with title "${challenge.title}" ? This action cannot be undone.`,
                          'confirm',
                          challenge.id
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>

                  {expandedChallenge === challenge.id &&
                    challenge.test_cases && (
                      <div className="mt-4 card bg-base-300 p-4 ">
                        <h3 className="font-medium mb-2">Test Cases:</h3>
                        <div className="space-y-4 max-h-60 overflow-y-auto">
                          {challenge.test_cases.map((testCase, index) => (
                            <div
                              key={testCase.id}
                              className="card bg-base-100 max-w-250 p-3"
                            >
                              <h4 className="font-medium">
                                Test Case {index + 1}
                              </h4>
                              <div className="font-mono text-sm">
                                <div className="pl-2 border-l-2 border-amber-400 mt-1">
                                  <p>Input:</p>
                                  <div className="max-h-40 overflow-y-auto">
                                    <pre className="bg-base-300 p-2 rounded whitespace-pre-wrap break-words w-full overflow-hidden">
                                      {testCase.input || 'N/A'}
                                    </pre>
                                  </div>
                                </div>
                                <div className="pl-2 border-l-2 border-green-400 mt-2">
                                  <p>Expected Output:</p>
                                  <div className="max-h-40 overflow-y-auto">
                                    <pre className="bg-base-300 p-2 rounded whitespace-pre-wrap break-words w-full overflow-hidden">
                                      {testCase.output || 'N/A'}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-base-content/60 py-16">
            <p>No available challenges for the selected filters.</p>
            <button
              onClick={clearFilters}
              className="mt-4 cursor-pointer px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 text-sm font-medium transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        )}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={loading || currentPage === 1}
              title="Previous Page"
            >
              ←
            </button>

            {Array.from({ length: Math.min(3, totalPages) }, (_, idx) => (
              <button
                key={idx}
                className={`btn btn-sm ${
                  currentPage === idx + 1 ? 'border-amber-400' : 'btn-ghost'
                }`}
                onClick={() => setCurrentPage(idx + 1)}
                disabled={loading}
              >
                {idx + 1}
              </button>
            ))}

            {totalPages > 4 && <span className="px-2 text-gray-500">...</span>}

            {currentPage > 2 && currentPage < totalPages - 1 && (
              <button
                className="btn btn-sm border-amber-400"
                onClick={() => setCurrentPage(currentPage)}
                disabled={loading}
              >
                {currentPage + 1}
              </button>
            )}

            {totalPages > 3 && (
              <button
                className={`btn btn-sm ${
                  currentPage === totalPages - 1
                    ? 'border-amber-400'
                    : 'btn-ghost'
                }`}
                onClick={() => setCurrentPage(totalPages - 1)}
                disabled={loading}
              >
                {totalPages}
              </button>
            )}

            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={loading || currentPage >= totalPages}
              title="Next Page"
            >
              →
            </button>
          </div>
        )}
      </div>

      {modal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-base-200 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              {modal.type === 'confirm' && (
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
              {modal.type === 'success' && (
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
              <h3 className="font-bold text-lg" id="modal-title">
                Delete Challenge
              </h3>
            </div>
            <p className="py-4">{modal.message}</p>
            <div className="flex justify-end gap-3 mt-4">
              {modal.type === 'confirm' ? (
                <>
                  <button
                    className="btn btn-ghost"
                    onClick={closeModal}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-error"
                    onClick={confirmDelete}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm mr-2"></span>
                        Deleting...
                      </>
                    ) : (
                      'Delete'
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

export default ManageChallenges;
