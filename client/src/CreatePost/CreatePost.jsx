import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreatePost = ({ setActivePage }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  const backToForum = () => {
    setActivePage("forum");
    navigate("/dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.id || !user.name) {
      alert("You must be logged in to create a post.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("/forum/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          authorId: user.id,
          authorName: user.name,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Post created successfully:", data);
      alert("Post created successfully!");
      navigate("/dashboard"); // Navigate back to the forum or dashboard
    } catch (error) {
      console.error("Error creating post:", error);
      alert(`Failed to create post: ${error.message}`);
    }
  };

  return (
    <div data-theme="luxury" className="min-h-screen bg-base-100 p-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-base-content">
            Create a Post
          </h2>
          <button onClick={backToForum} className="btn btn-outline gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Forum
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card bg-base-200 shadow-xl w-full"
        >
          <div className="card-body p-6 sm:p-8">
            <div className="space-y-8">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-lg font-medium">Title</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your post title"
                  className="input input-bordered input-lg w-full focus:input-primary"
                  required
                />
              </div>

              <div className="flex flex-col form-control w-full">
                <label className="label">
                  <span className="label-text text-lg font-medium">
                    Content
                  </span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post content here..."
                  className="textarea textarea-bordered min-h-[300px] sm:min-h-[400px] w-full text-base leading-relaxed focus:textarea-primary p-4"
                  required
                ></textarea>
              </div>
            </div>

            <div className="card-actions justify-end mt-8">
              <button
                type="button"
                onClick={backToForum}
                className="btn btn-ghost btn-lg"
              >
                Cancel
              </button>
              <button type="submit" className="btn border-amber-400 btn-lg">
                Publish Post
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
