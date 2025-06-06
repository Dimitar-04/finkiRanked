import React, { useEffect, useState } from "react";

const ForumPostDetail = ({ post, onBack }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!post) return;
    setLoading(true);
    setError(null);
    fetch(`/forum/comments?post_id=${post.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch comments");
        return res.json();
      })
      .then((data) => {
        setComments(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [post]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPosting(true);
    setError(null);
    const user = JSON.parse(localStorage.getItem("user"));
    try {
      const response = await fetch("/forum/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: post.id,
          content: commentText,
          authorId: user?.id,
          authorName: user?.name,
        }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to post comment");
      }
      setCommentText("");
      // Refresh comments
      fetch(`/forum/comments?post_id=${post.id}`)
        .then((res) => res.json())
        .then((data) => setComments(data));
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  };

  if (!post) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 px-2 py-8">
      <div className="w-full max-w-2xl">
        <button className="btn btn-ghost mb-4" onClick={onBack}>
          ← Back to Forum
        </button>
        <div className="card bg-base-100 shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
            <h2 className="card-title text-3xl break-words">{post.title}</h2>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <span className="badge badge-primary text-xs">
                By {post.author_name}
              </span>
            </div>
          </div>
          <div className="text-base-content/80 text-lg mb-4 whitespace-pre-line break-words">
            {post.content}
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg p-6 mb-8">
          <h3 className="text-2xl font-semibold mb-4">Comments</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="text-gray-400">Loading comments...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : comments.length > 0 ? (
              comments.map((comment, idx) => (
                <div
                  key={comment.id || idx}
                  className="p-4 rounded-lg bg-base-200 border border-base-300"
                >
                  <div className="flex items-center gap-2 mb-1">
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
              ))
            ) : (
              <div className="text-gray-400">No comments yet.</div>
            )}
          </div>
          <form className="mt-6" onSubmit={handleSubmit}>
            <label className="block mb-2 text-base font-medium">
              Add a comment
            </label>
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
                className="btn btn-primary"
                disabled={posting || !commentText.trim()}
              >
                {posting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForumPostDetail;
