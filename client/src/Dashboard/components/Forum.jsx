import React from "react";
import { useNavigate } from "react-router-dom";
import commentIcon from "../../assets/images/comment.svg";
import likeIcon from "../../assets/images/like.svg";

const Forum = () => {
  const navigate = useNavigate();

  const posts = [
    {
      id: 1,
      title: "How to learn React?",
      author: "John Doe",
      content:
        "React is a popular JavaScript library for building user interfaces. Start by learning the basics of components, state, and props.",
    },
    {
      id: 2,
      title: "Best practices for Tailwind CSS",
      author: "Jane Smith",
      content:
        "Tailwind CSS is a utility-first CSS framework. Use consistent class naming and leverage configuration files for customization.",
    },
    {
      id: 3,
      title: "Understanding JavaScript closures",
      author: "Alice Johnson",
      content:
        "Closures are a fundamental concept in JavaScript. They allow functions to access variables from their outer scope even after the outer function has returned.",
    },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      {/* Forum Posts */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">Forum Posts</h1>
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold">{post.title}</h2>
              <p className="text-sm text-gray-500">By {post.author}</p>
              <p className="mt-2 text-gray-700">{post.content}</p>
              <div className="mt-4 flex gap-4">
                <img
                  src={commentIcon}
                  alt="Comment"
                  className="w-6 h-6 cursor-pointer hover:opacity-80"
                />
                <img
                  src={likeIcon}
                  alt="Like"
                  className="w-6 h-6 cursor-pointer hover:opacity-80"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create a Post Button */}
      <div className="w-full md:w-1/4">
        <div className=" flex items-center justify-center">
          <button
            onClick={() => navigate("/create-post")}
            className="cursor-pointer px-6 py-3 bg-yellow-500 text-black rounded hover:bg-yellow-600"
          >
            Create a Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default Forum;
