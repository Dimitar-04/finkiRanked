import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import doneAll from '../../assets/images/done-all.svg';
import trashIcon from '../../assets/images/delete.svg'; // Add this import
import Navbar from './Navbar';

const ManagePosts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    message: '',
    type: '',
    postId: null,
    post: null,
  });
  const postsPerPage = 5;
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    try {
      if (page === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(
        `/review/posts?page=${page}&limit=${postsPerPage}&userId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched posts data:', data);

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
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(
        `/review/posts/${postId}?userId=${user.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      console.log('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleApprovePost = async (post) => {
    try {
      const response = await fetch(
        `/review/posts/${post.id}?userId=${user.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            authorId: user.id,
            authorName: user.name,
            title: post.title,
            content: post.content,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setPosts((prevPosts) =>
        prevPosts.filter((postce) => postce.id !== post.id)
      );
      console.log('Post approved successfully');
    } catch (error) {
      console.error('Error approving post:', error);
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
          <h1 className="text-4xl font-bold mb-10">Posts that need approval</h1>
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
                        'Are you sure you want to approve this post?'
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
                        'Are you sure you want to delete this post?'
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

      {/* Modal */}
      <div className={`modal ${modal.isOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <div className="flex items-center gap-3 mb-4">
            {modal.type === 'approve' && (
              <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
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
            {modal.type === 'delete' && (
              <div className="w-8 h-8 rounded-full bg-error flex items-center justify-center">
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
            <h3 className="font-bold text-lg">
              {modal.type === 'approve' && 'Approve Post'}
              {modal.type === 'delete' && 'Delete Post'}
            </h3>
          </div>
          <p className="py-4">{modal.message}</p>
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={closeModal}>
              Cancel
            </button>
            <button
              className={`btn ${
                modal.type === 'approve' ? 'btn-success' : 'btn-error'
              }`}
              onClick={confirmAction}
            >
              {modal.type === 'approve' ? 'Approve' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePosts;
