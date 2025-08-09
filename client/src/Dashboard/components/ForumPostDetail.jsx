import React, { use, useEffect, useState } from 'react';
import trashIcon from '../../assets/images/delete.svg';
import Navbar from './Navbar';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  getCommentsForPost,
  createComment,
  deleteComment,
} from '@/services/forumService';
import { useCallback } from 'react';

const ForumPostDetail = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [modal, setModal] = useState({
    isOpen: false,
    message: '',
    type: '',
    commentId: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const location = useLocation();
  const statePost = useState(location.state?.post || {});
  const fromPath = location.state?.from || '/dashboard/forum';
  const fromForumSearchPrams = location.state?.fromForumSearch;
  const post = statePost[0];
  const [posting, setPosting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { postId } = useParams();

  const showModal = (message, type = 'info', commentId = null) => {
    setModal({ isOpen: true, message, type, commentId });
  };

  const closeModal = () => {
    setModal({ isOpen: false, message: '', type: '', commentId: null });
  };

  const confirmDelete = async () => {
    if (modal.commentId) {
      setIsDeleting(true);
      await handleDeleteComment(modal.commentId);
      setIsDeleting(false);
    }
  };

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCommentsForPost(postId);
      setComments(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch comments');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (!post && postId) {
      console.warn(
        'Post details not available from location state. Consider fetching post by ID.'
      );
    }
  }, [post, postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );
      showModal('Comment deleted successfully.', 'success');
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError(error.message || 'Failed to delete comment');
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user || !postId) return;
    setPosting(true);
    setError(null);

    try {
      const commentData = {
        post_id: postId,
        content: commentText,
        authorId: user.id,
        authorName: user.username,
      };
      await createComment(commentData);
      setCommentText('');
      fetchComments();
    } catch (err) {
      // Check for inappropriate language error from backend
      const message =
        err?.response?.data?.error || err?.message || 'Failed to post comment';
      if (
        message.toLowerCase().includes('inappropriate language') ||
        message.toLowerCase().includes('not on topic') ||
        message.toLowerCase().includes('profanity')
      ) {
        showModal(
          'Your comment was not posted because it contains inappropriate language or is not on topic.',
          'error'
        );
      } else {
        setError(message);
      }
      console.error('Error posting comment:', err);
    } finally {
      setPosting(false);
    }
  };

  if (!postId) return null;

  return (
    <div
      data-theme="luxury"
      className="dashboard h-screen flex bg-base-100 overflow-hidden"
    >
      <div className="flex flex-col w-full items-center h-full overflow-y-auto bg-base-200 px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="w-full max-w-2xl">
          <button
            className="btn btn-ghost mb-4 text-sm sm:text-base"
            onClick={() => {
              const targetUrl = fromForumSearchPrams
                ? `${fromPath}?${fromForumSearchPrams}`
                : fromPath;
              navigate(targetUrl);
            }}
          >
            ← Back to {fromPath.includes('user-posts') ? 'Your Posts' : 'Forum'}
          </button>

          <div className="card bg-base-100 shadow-xl p-3 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-row gap-3 sm:gap-4 mb-2 overflow-hidden">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl 2xl:text-3xl break-words leading-tight">
                  {post.title}
                </h2>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="badge badge-tertiary text-xs p-2 sm:p-4">
                  By {post.author_name}
                </span>
              </div>
            </div>
            <div className="text-base-content/80 text-sm sm:text-base 2xl:text-lg mb-4 whitespace-pre-line break-words leading-relaxed">
              {post.content}
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg p-3 sm:p-6 mb-6 sm:mb-8">
            <form className="mt-4 sm:mt-6" onSubmit={handleSubmitComment}>
              <h3 className="text-lg sm:text-xl 2xl:text-2xl font-semibold mb-3 sm:mb-4">
                Comments ({comments.length})
              </h3>
              <textarea
                className="textarea textarea-bordered w-full min-h-[80px] text-sm sm:text-base"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={posting}
                maxLength={500}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  className="btn btn-tertiary btn-sm sm:btn-md"
                  disabled={posting || !commentText.trim()}
                >
                  {posting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>

            <div className="mt-6 sm:mt-8">
              <div className="h-48 sm:h-64 overflow-y-auto pr-1 sm:pr-2 space-y-3 sm:space-y-4 rounded-md">
                {loading ? (
                  <div className="text-gray-400 p-3 text-sm sm:text-base">
                    Loading comments...
                  </div>
                ) : error ? (
                  <div className="text-red-500 p-3 text-sm sm:text-base">
                    {error}
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment, idx) => (
                    <div
                      key={comment.id || idx}
                      className="p-3 sm:p-4 rounded-lg bg-base-200 border border-base-300"
                    >
                      <div className="flex relative items-start gap-2 mb-1">
                        {(comment.author_id === user.id ||
                          user.isModerator) && (
                          <button
                            className="absolute top-1 sm:top-2 right-1 sm:right-2 p-1 sm:p-1.5 cursor-pointer rounded-full hover:bg-gray-600 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              showModal(
                                'Are you sure you want to delete this comment? This action cannot be undone.',
                                'confirm',
                                comment.id
                              );
                            }}
                          >
                            <img
                              src={trashIcon}
                              alt="Delete"
                              className="w-4 h-4 sm:w-6 sm:h-6"
                            />
                          </button>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 pr-8 sm:pr-10">
                          <span className="font-semibold text-base-content text-sm sm:text-base">
                            {comment.author_name}
                          </span>
                          <span className="text-xs text-base-content/60">
                            {comment.dateCreated
                              ? new Date(comment.dateCreated).toLocaleString()
                              : ''}
                          </span>
                        </div>
                      </div>
                      <div className="text-base-content/80 text-sm sm:text-base break-words leading-relaxed pr-6 sm:pr-0">
                        {comment.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 p-3 text-sm sm:text-base">
                    No comments yet.
                  </div>
                )}
              </div>
            </div>
          </div>
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
              {modal.type === 'error' && (
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-error flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-error-content"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
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
              {modal.type === 'confirm' || modal.type == 'success' ? (
                <h3 className="font-bold text-lg" id="modal-title">
                  Delete Comment
                </h3>
              ) : (
                <h3 className="font-bold text-lg" id="modal-title">
                  Comment Not Allowed
                </h3>
              )}
            </div>
            <p className="py-4">{modal.message}</p>
            <div className="flex justify-end gap-3 mt-4">
              {modal.type === 'confirm' ? (
                <>
                  <button
                    className="btn btn-ghost"
                    onClick={closeModal}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-error"
                    onClick={confirmDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
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

export default ForumPostDetail;
