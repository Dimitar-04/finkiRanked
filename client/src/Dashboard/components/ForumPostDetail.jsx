import React, { useEffect, useState } from "react";
import trashIcon from "../../assets/images/delete.svg";
import Navbar from "./Navbar";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  getCommentsForPost,
  createComment,
  deleteComment,
} from "@/services/forumService";
import { useCallback } from "react";

const ForumPostDetail = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const location = useLocation();
  const statePost = useState(location.state?.post || {});
  const post = statePost[0];
  const [posting, setPosting] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const { postId } = useParams();

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCommentsForPost(postId);
      setComments(data);
    } catch (err) {
      setError(err.message || "Failed to fetch comments");
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (!post && postId) {
      console.warn(
        "Post details not available from location state. Consider fetching post by ID."
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
      console.log("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      setError(error.message || "Failed to delete comment");
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
      setCommentText("");
      fetchComments();
    } catch (err) {
      setError(err.message || "Failed to post comment");
      console.error("Error posting comment:", err);
    } finally {
      setPosting(false);
    }
  };

  if (!postId) return null;

  return (
    <div
      data-theme="luxury"
      className="dashboard h-screen flex bg-base-100 overflow-none"
    >
      <Navbar></Navbar>
      <div className="flex flex-col w-full items-center justify-center h-full overflow-y-auto bg-base-200 px-2 py-8">
        <div className="w-full h-full max-w-2xl">
          <button
            className="btn btn-ghost mb-4"
            onClick={() => navigate("/dashboard/forum")}
          >
            ← Back to Forum
          </button>
          <div className="card bg-base-100 shadow-xl  p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
              <h2 className="card-title text-3xl break-words">{post.title}</h2>

              <div className="flex items-center gap-2 mt-2 md:mt-0">
                <span className="badge badge-tertiary text-xs p-4 ">
                  By {post.authorName}
                </span>
              </div>
            </div>
            <div className="text-base-content/80 text-lg mb-4 whitespace-pre-line break-words">
              {post.content}
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg p-6 mb-8">
            <form className="mt-6" onSubmit={handleSubmitComment}>
              <h3 className="text-2xl font-semibold mb-4">
                Comments ({comments.length})
              </h3>
              <textarea
                className="textarea textarea-bordered w-full min-h-[80px]"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={posting}
                maxLength={500}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  className="btn btn-tertiary"
                  disabled={posting || !commentText.trim()}
                >
                  {posting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </form>

            <div className="mt-8">
              <div className="h-64 overflow-y-auto pr-2 space-y-4 rounded-md">
                {loading ? (
                  <div className="text-gray-400 p-3">Loading comments...</div>
                ) : error ? (
                  <div className="text-red-500 p-3">{error}</div>
                ) : comments.length > 0 ? (
                  (console.log(comments),
                  comments.map(
                    (comment, idx) => (
                      console.log(comment),
                      (
                        <div
                          key={comment.id || idx}
                          className="p-4 rounded-lg bg-base-200 border border-base-300"
                        >
                          <div className="flex relative items-center gap-2 mb-1">
                            {(comment.authorId === user.id ||
                              user.isModerator) && (
                              <button
                                className=" absolute top-2 right-2 p-1.5 cursor-pointer rounded-full hover:bg-gray-600 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Here you would add the delete confirmation and logic
                                  if (
                                    window.confirm(
                                      "Are you sure you want to delete this comment?"
                                    )
                                  ) {
                                    // Call your delete comment function here
                                    console.log("Delete comment:", comment.id);
                                  }
                                  handleDeleteComment(comment.id);
                                }}
                              >
                                <img
                                  src={trashIcon}
                                  alt="Delete"
                                  className="w-6 h-6"
                                />
                              </button>
                            )}
                            <span className="font-semibold text-base-content">
                              {comment.authorName}
                            </span>
                            <span className="text-xs text-base-content/60">
                              {comment.dateCreated
                                ? new Date(comment.dateCreated).toLocaleString()
                                : ""}
                            </span>
                          </div>
                          <div className="text-base-content/80 text-base break-words">
                            {comment.content}
                          </div>
                        </div>
                      )
                    )
                  ))
                ) : (
                  <div className="text-gray-400 p-3">No comments yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumPostDetail;
