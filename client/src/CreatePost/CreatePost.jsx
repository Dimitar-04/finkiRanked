import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Post submitted:", { title, content });
    // Add your submission logic here
  };

  return (
    <div data-theme="luxury" className="min-h-screen bg-base-100 p-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-base-content">
            Create a Post
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline gap-2"
          >
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
                onClick={() => navigate(-1)}
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
