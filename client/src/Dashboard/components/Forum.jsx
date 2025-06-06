import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import commentIcon from "../../assets/images/comment.svg";
import likeIcon from "../../assets/images/like.svg";

const Forum = ({ setActivePage, onPostClick }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const postsPerPage = 5; // Number of posts to fetch per request

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(
        `/forum/posts?page=${page}&limit=${postsPerPage}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (page === 0) {
        setPosts(data);
        console.log("Fetched posts:", data);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...data]);
      }
      if (data.length < postsPerPage) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching forum posts:", error);
    }
  };

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 h-full overflow-y-auto w-full">
      {/* Forum Posts */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">Forum Posts</h1>
        <div className="space-y-4" w-300>
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => onPostClick && onPostClick(post)}
            >
              <h2 className="text-lg font-semibold">{post.title}</h2>
              <p className="text-sm text-gray-500">By {post.authorName}</p>
              <p className="mt-2 text-gray-700">
                {post.content && post.content.length > 300
                  ? post.content.slice(0, 300) + "..."
                  : post.content}
              </p>
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
        {hasMore && (
          <div className="flex justify-center mt-6">
            <button onClick={handleLoadMore} className="btn btn-outline">
              Load More
            </button>
          </div>
        )}
      </div>

      {/* Create a Post Button */}
      <div className="w-full md:w-1/4">
        <div className="flex flex-row justify-end p-6 rounded-lg shadow-md">
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
