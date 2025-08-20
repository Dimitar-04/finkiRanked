import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createForumPost } from '@/services/forumService';
import { useAuth } from '@/contexts/AuthContext';
import {
  createApprovalForumPost,
  discardApprovalForumPost,
} from '@/services/reviewService';
import { getTasksForForumPost } from '@/services/taskService';
const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const location = useLocation();
  const fromPath = location.state?.from || '/dashboard/forum';

  const fromForumSearchParams = location.state?.fromForumSearch;
  const fromUserPostsSearchParams = location.state?.fromUserPostsSearch;
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingModerator, setPendingModerator] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState(0);
  const [challenges, setChallenges] = useState([]);
  const [topic, setTopic] = useState('general');
  const [modal, setModal] = useState({ isOpen: false, message: '', type: '' });
  const navigate = useNavigate();
  useEffect(() => {
    if (modal.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modal.isOpen]);

  const showModal = (message, type = 'info') => {
    setModal({ isOpen: true, message, type });
  };

  const closeModal = () => {
    setModal({ isOpen: false, message: '', type: '' });
    if (modal.type === 'success' || modal.type === 'pending') {
      let targetUrl = fromPath;

      if (fromForumSearchParams) {
        targetUrl = `${fromPath}?${fromForumSearchParams}`;
      } else if (fromUserPostsSearchParams) {
        targetUrl = `${fromPath}?${fromUserPostsSearchParams}`;
      }

      navigate(targetUrl);
    } else if (modal.type === 'auth') {
      navigate('/login');
    }
  };

  const handleTopicChange = async (e) => {
    const selectedTopic = e.target.value;
    setTopic(selectedTopic);

    if (selectedTopic === 'daily-challenge') {
      console.log(challenges);
      if (!challenges || challenges.length === 0) {
        try {
          const response = await getTasksForForumPost();
          setChallenges(response);
        } catch (error) {
          setChallenges([]);
          console.error('Error fetching challenges:', error);
          showModal(
            'Failed to load challenges. Please try again later.',
            'error'
          );
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user || !user.id || !user.username) {
      showModal('You must be logged in to create a post.', 'auth');
      setIsSubmitting(false);
      return;
    }

    try {
      const postData = {
        title,
        content,
        authorId: user.id,
        authorName: user.username,
        topic,
        challengeId:
          topic === 'daily-challenge' && challenges.length > 0
            ? challenges[selectedChallengeId]?.id || null
            : null,
      };
      const res = await createForumPost(postData);
      if (res.reason === 'USER_FLAGGED') {
        setPendingModerator(true);
        showModal(res.message, 'moderatorPrompt');
      } else if (res.message.includes('moderator approval')) {
        showModal(res.message, 'pending');
      } else {
        showModal('Post created successfully!', 'success');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.response) {
        if (
          error.response.status === 202 &&
          error.response.data?.message?.includes('moderator approval')
        ) {
          showModal(
            error.response.data.message ||
              'Content is too long. Your post has been submitted for moderator approval.',
            'pending'
          );
        } else if (error.response.status === 401) {
          showModal('Authentication failed. Please log in again.', 'auth');
        } else {
          showModal(
            error.response.data?.error ||
              error.response.data?.message ||
              `Error: ${error.message}`,
            'error'
          );
        }
      } else {
        showModal(`An unexpected error occurred: ${error.message}`, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleModeratorDecision = async (decision) => {
    setPendingModerator(false);
    if (decision === 'yes') {
      try {
        const postData = {
          title,
          content,
          authorId: user.id,
          authorName: user.username,
        };
        const res = await createApprovalForumPost(postData);

        showModal(
          res.message || 'Your post has been submitted for moderator approval.',
          'pending'
        );
      } catch (error) {
        showModal(
          error.response?.data?.error ||
            'Failed to submit post for moderator approval.',
          'error'
        );
      }
    } else {
      discardApprovalForumPost(user.id);
      setModal({ isOpen: false, message: '', type: '' });
    }
  };
  useEffect(() => {
    if (topic === 'daily-challenge' && challenges.length > 0) {
      setSelectedChallengeId(0);
    }
  }, [topic, challenges]);

  return (
    <div
      data-theme="luxury"
      className="min-h-screen bg-base-100 p-3 sm:p-4 lg:p-6"
    >
      <div className="max-w-3xl mx-auto px-2 sm:px-4 lg:px-6 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-base-content">
            Create a Post
          </h2>
          <button
            onClick={() => {
              const targetUrl = fromForumSearchParams
                ? `${fromPath}?${fromForumSearchParams}`
                : fromUserPostsSearchParams
                ? `${fromPath}?${fromUserPostsSearchParams}`
                : `${fromPath}`;
              navigate(targetUrl);
            }}
            className="btn btn-outline btn-sm sm:btn-md gap-2 w-full sm:w-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 sm:w-5 sm:h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {fromPath === '/dashboard/forum'
              ? 'Back to Forum'
              : 'Back to Your Posts'}
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card bg-base-200 shadow-xl w-full relative"
        >
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
            <div className="dropdown dropdown-hover dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle btn-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div
                tabIndex={0}
                className="dropdown-content z-[1] card card-compact w-64 sm:w-72 p-2 shadow bg-base-200 text-base-content border border-base-300"
              >
                <div className="card-body">
                  <h3 className="font-bold text-sm sm:text-base mb-2">
                    Posting Guidelines
                  </h3>
                  <div className="space-y-1.5 text-xs sm:text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span>Keep discussions respectful and constructive</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span>Use clear, descriptive titles</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span>Share academic resources and study tips</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span>Ask questions about courses and assignments</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-error">✗</span>
                      <span>No spam, offensive, or inappropriate content</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-error">✗</span>
                      <span>No sharing of exam answers or cheating</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-error">✗</span>
                      <span>No personal attacks or harassment</span>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-warning/20 rounded-lg">
                    <p className="text-xs">
                      <strong>Note:</strong> Posts exceeding character limits or
                      containing sensitive content will be reviewed by
                      moderators before publication.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-body p-3 sm:p-4 lg:p-6">
            <div className="space-y-4 sm:space-y-5">
              <div className="form-control w-full">
                <label className="label mb-1">
                  <span className="label-text text-sm sm:text-base font-medium">
                    Topic
                  </span>
                </label>
                <select
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    handleTopicChange(e);
                  }}
                  className="select select-bordered w-full"
                  required
                  disabled={isSubmitting}
                >
                  <option value="general">General Programming</option>
                  <option value="daily-challenge">Daily Challenge</option>
                </select>
              </div>
              {topic === 'daily-challenge' &&
                challenges.length > 0 &&
                typeof selectedChallengeId === 'number' && (
                  <div className="form-control w-full">
                    <label className="label mb-1">
                      <span className="label-text text-sm sm:text-base font-medium">
                        Select Challenge
                      </span>
                    </label>

                    <div className="card bg-base-300 shadow-md border border-base-300">
                      <div className="card-body p-3 sm:p-4">
                        <div className="flex items-center justify-between gap-2 sm:gap-3">
                          <button
                            type="button"
                            className="btn btn-circle btn-sm sm:btn-md btn-outline hover:btn-primary transition-all duration-200"
                            onClick={() =>
                              setSelectedChallengeId((i) =>
                                Math.min(i + 1, challenges.length - 1)
                              )
                            }
                            disabled={
                              selectedChallengeId === challenges.length - 1
                            }
                            aria-label="Previous Challenge"
                          >
                            <svg
                              width="20"
                              height="20"
                              fill="none"
                              viewBox="0 0 24 24"
                              className="w-4 h-4 sm:w-5 sm:h-5"
                            >
                              <path
                                d="M15 19l-7-7 7-7"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          <div className="flex-1 text-center px-2">
                            <h3 className="font-semibold text-sm sm:text-base text-base-content leading-tight">
                              {challenges[selectedChallengeId]?.title
                                .split('-')
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                )
                                .join(' ') || 'No challenge title'}
                            </h3>
                            {challenges[selectedChallengeId]?.solving_date &&
                              selectedChallengeId > 0 && (
                                <p className="text-xs sm:text-sm text-base-content/70 mt-1">
                                  This challenge was available on:{' '}
                                  <span className="underline">
                                    {new Date(
                                      challenges[
                                        selectedChallengeId
                                      ].solving_date
                                    ).toLocaleDateString('en-GB', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </p>
                              )}
                          </div>

                          <button
                            type="button"
                            className="btn btn-circle btn-sm sm:btn-md btn-outline hover:btn-primary transition-all duration-200"
                            onClick={() =>
                              setSelectedChallengeId((i) => Math.max(i - 1, 0))
                            }
                            disabled={selectedChallengeId === 0}
                            aria-label="Next Challenge"
                          >
                            <svg
                              width="20"
                              height="20"
                              fill="none"
                              viewBox="0 0 24 24"
                              className="w-4 h-4 sm:w-5 sm:h-5"
                            >
                              <path
                                d="M9 5l7 7-7 7"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="mt-2 sm:mt-3">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xs sm:text-sm text-base-content/60">
                              This post will be linked to the selected challenge
                            </span>
                            <div
                              className="tooltip tooltip-top"
                              data-tip="Your post will appear in the challenge's discussion thread"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4 text-base-content/40 cursor-help"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              <div className="form-control w-full">
                <label className="label mb-1">
                  <span className="label-text text-sm sm:text-base font-medium">
                    Title
                  </span>
                </label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your post title"
                  className="input input-bordered input-md w-full focus:input-primary"
                  required
                />
              </div>

              <div className="flex flex-col form-control w-full">
                <label className="label mb-1">
                  <span className="label-text text-sm sm:text-base font-medium">
                    Content
                  </span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post content here..."
                  className="textarea textarea-bordered min-h-[200px] sm:min-h-[250px] lg:min-h-[300px] w-full text-sm sm:text-base leading-relaxed focus:textarea-primary p-3 sm:p-4"
                  required
                  disabled={isSubmitting}
                ></textarea>
              </div>
            </div>

            <div className="card-actions justify-end mt-4 sm:mt-6 gap-2 flex-col sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/dashboard/forum')}
                className="btn btn-ghost btn-md w-full sm:w-auto order-2 sm:order-1"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn border-amber-400 btn-md w-full sm:w-auto order-1 sm:order-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Publishing...
                  </>
                ) : (
                  'Publish Post'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Modal element */}
      {modal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50 backdrop-blur-xs p-4"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-base-200 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              {modal.type === 'success' && (
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-success flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-success-content"
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
              {modal.type === 'pending' && (
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-warning flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-warning-content"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                    ></path>
                  </svg>
                </div>
              )}
              {modal.type == 'moderatorPrompt' && (
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-warning flex items-center justify-center shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <circle cx="12" cy="17" r="1" fill="currentColor" />
                  </svg>
                </div>
              )}
              {(modal.type === 'auth' || modal.type === 'error') && (
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-error flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-error-content"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {modal.type === 'auth' ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      ></path>
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    )}
                  </svg>
                </div>
              )}
              <h3 className="font-bold text-base sm:text-lg" id="modal-title">
                {modal.type === 'success' && 'Success!'}
                {modal.type === 'pending' && 'Pending Approval'}
                {modal.type === 'auth' && 'Authentication Required'}
                {modal.type === 'error' && 'Error'}
                {modal.type === 'moderatorPrompt' &&
                  'We found your recent posts inappropriate'}
              </h3>
            </div>
            <div className="flex py-3 sm:py-4  items-center gap-3 ">
              <p className="font-bold text-sm sm:text-base whitespace-pre-line ">
                {modal.message}
              </p>
            </div>
            <div className="flex justify-end gap-2 mt-6 sm:mt-8">
              {modal.type === 'moderatorPrompt' ? (
                <>
                  <button
                    className="btn btn-success btn-sm sm:btn-md"
                    onClick={() => handleModeratorDecision('yes')}
                  >
                    Yes
                  </button>
                  <button
                    className="btn btn-error btn-sm sm:btn-md"
                    onClick={() => handleModeratorDecision('no')}
                  >
                    No
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

export default CreatePost;
