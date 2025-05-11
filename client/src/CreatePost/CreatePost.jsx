import React, { useState } from "react";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Post submitted:", { title, content });
    // Add your submission logic here
  };

  return (
    <div
      data-theme="luxury"
      className="flex items-center justify-center min-h-screen"
    >
      <form
        className="p-8 rounded-lg shadow-md w-full max-w-md border"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-6">Create a Post</h2>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium  mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border  rounded-lg focus:outline-none focus:ring-2 "
          />
        </div>
        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-medium ">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="10"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 "
          ></textarea>
        </div>
        <button
          type="submit"
          className="btn btn-active w-full  py-2 px-4 rounded-lg hover: transition duration-200"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
