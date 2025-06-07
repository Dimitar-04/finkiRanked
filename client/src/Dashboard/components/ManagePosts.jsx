import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import doneAll from "../../assets/images/done-all.svg";
import trashIcon from "../../assets/images/delete.svg"; // Add this import
import Navbar from "./Navbar";

const ManagePosts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const postsPerPage = 5;
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(
        `/review/posts?page=${page}&limit=${postsPerPage}`
      );
      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched posts data:", data);

      if (page === 0) {
        setPosts(data);
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
  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(`/review/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      console.log("Post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleApprovePost = async (post) => {
    try {
      const response = await fetch(`/review/posts/${post.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorId: user.id,
          authorName: user.name,
          title: post.title,
          content: post.content,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setPosts((prevPosts) =>
        prevPosts.filter((postce) => postce.id !== post.id)
      );
      console.log("Post approved successfully");
    } catch (error) {
      console.error("Error approving post:", error);
    }
  };

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  return (
    <div
      data-theme="luxury"
      className="dashboard h-screen flex bg-base-100 overflow-none"
    >
      <Navbar></Navbar>
      <div className="flex flex-col md:flex-row gap-6 p-6 h-full overflow-y-auto w-full">
        <div className="flex-1 ml-8">
          <h1 className="text-3xl font-bold mb-4">Posts that need approval</h1>
          <div className="space-y-4" w-300>
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-4 border rounded-lg shadow-sm hover:shadow-md transition  relative"
              >
                <button
                  className=" absolute top-2 right-20 p-1.5 cursor-pointer rounded-full hover:bg-gray-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();

                    if (
                      window.confirm(
                        "Are you sure you want to approve this post?"
                      )
                    ) {
                      handleApprovePost(post);
                    }
                  }}
                >
                  <img src={doneAll} alt="Approve" className="w-10 h-10" />
                </button>
                <button
                  className=" absolute top-2 right-8 p-1.5 cursor-pointer rounded-full hover:bg-gray-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      window.confirm(
                        "Are you sure you want to delete this post?"
                      )
                    ) {
                      handleDeletePost(post.id);
                    }
                  }}
                >
                  <img src={trashIcon} alt="Delete" className="w-10 h-10" />
                </button>

                <div className="flex items-center gap-4 mt-2">
                  <h2
                    className="text-3xl font-semibold mb-2 cursor-pointer hover:underline"
                    onClick={() => {
                      console.log("Post clicked:", post);
                      navigate(`/dashboard/forum-detail/${post.id}`, {
                        state: { post },
                      });
                    }}
                  >
                    {post.title}
                  </h2>
                </div>

                <p className="text-m text-gray-500">
                  By {post.authorName},{" "}
                  <span>{post.dateCreated.split("T")[0]}</span>
                </p>
                <p className="mt-2 text-gray-400 text-xl">
                  {post.content && post.content.length > 300
                    ? post.content.slice(0, 300) + "..."
                    : post.content}
                </p>
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
      </div>
    </div>
  );
};

export default ManagePosts;
