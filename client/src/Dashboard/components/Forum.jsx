import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import commentIcon from '../../assets/images/comment.svg';
import trashIcon from '../../assets/images/delete.svg'; // Add this import
import Navbar from './Navbar';
const Forum = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const postsPerPage = 5;
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    const token = localStorage.getItem('jwt');
    console.log(token);
    try {
      if (page === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await fetch(
        `/forum/posts?page=${page}&limit=${postsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (page === 0) {
        setPosts(data);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...data]);
      }
      if (data.length < postsPerPage) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching forum posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleDeletePost = async (postId) => {
    const token = localStorage.getItem('jwt');
    try {
      const response = await fetch(`/forum/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      console.log('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  return (
    <div
      data-theme="luxury"
      className="dashboard h-screen flex bg-base-100 overflow-hidden"
    >
      <Navbar></Navbar>
      <div className="flex flex-col md:flex-row gap-6 p-6 h-full overflow-y-auto w-full">
        <div className="flex-1 ml-8 mb-6">
          <h1 className="text-4xl font-bold mb-10">Forum Posts</h1>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <>
              <div className="space-y-4 pb-8">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 border rounded-lg shadow-sm hover:shadow-md transition  relative"
                  >
                    {(post.authorName === user.name ||
                      post.authorName === user.username ||
                      user.isModerator) && (
                      <button
                        className=" absolute top-2 right-2 p-1.5 cursor-pointer rounded-full hover:bg-gray-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            window.confirm(
                              'Are you sure you want to delete this post?'
                            )
                          ) {
                            handleDeletePost(post.id);
                          }
                        }}
                      >
                        <img src={trashIcon} alt="Delete" className="w-6 h-6" />
                      </button>
                    )}

                    <div className="flex items-center gap-4 mt-2">
                      <h2
                        className="text-3xl font-semibold mb-2 cursor-pointer hover:underline"
                        onClick={() => {
                          console.log('Post clicked:', post);
                          navigate(`/dashboard/forum-detail/${post.id}`, {
                            state: { post },
                          });
                        }}
                      >
                        {post.title}
                      </h2>
                    </div>

                    <p className="text-m text-gray-500">
                      By {post.authorName},{' '}
                      <span>{post.dateCreated.split('T')[0]}</span>
                    </p>
                    <p className="mt-2 text-gray-400 text-xl">
                      {post.content && post.content.length > 300
                        ? post.content.slice(0, 300) + '...'
                        : post.content}
                    </p>
                    <div
                      className="mt-4 flex justify-end"
                      onClick={(e) => {
                        // Prevent clicking the post if the delete button was clicked
                        navigate(`/dashboard/forum-detail/${post.id}`, {
                          state: { post },
                        });
                      }}
                    >
                      <p className="mr-4">{post.comment_count}</p>
                      <img
                        src={commentIcon}
                        alt="Comment"
                        className="w-6 h-6 cursor-pointer hover:opacity-80"
                      />
                    </div>
                  </div>
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center mt-6">
                  <button 
                    onClick={handleLoadMore} 
                    className={`btn btn-outline mb-6 ${loadingMore ? 'btn-disabled' : ''}`}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <span className="loading loading-spinner loading-sm mr-2"></span>
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Create a Post Button */}
        <div className="w-full md:w-1/4">
          <div className="flex flex-row justify-end p-6 rounded-lg shadow-md">
            <button
              onClick={() => {
                navigate('/dashboard/create-post');
              }}
              className="cursor-pointer px-6 py-3 bg-yellow-500 text-black rounded hover:bg-yellow-600"
            >
              Create a Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forum;
