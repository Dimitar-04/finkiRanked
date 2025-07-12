import { useAuth } from "../../contexts/AuthContext.jsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPendingPosts } from "@/services/reviewService";
import { getAllPostsByUser } from "@/services/forumService.js";
import commentIcon from "../../assets/images/comment.svg";

const UserPosts = () => {
  const { user } = useAuth();
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("published");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      const fetchAllPosts = async () => {
        try {
          setLoading(true);

          const [approvedData, pendingData] = await Promise.all([
            getAllPostsByUser(),
            getPendingPosts(),
          ]);

          setApprovedPosts(approvedData);
          console.log(approvedData);
          setPendingPosts(pendingData);
        } catch (error) {
          console.error("Error fetching user posts:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchAllPosts();
    }
  }, []);

  const filteredApprovedPosts = approvedPosts.filter((post) => {
    const searchLower = searchQuery.toLowerCase();
    const postDate = new Date(post.date_created).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    return (
      post.title.toLowerCase().includes(searchLower) ||
      post.content.toLowerCase().includes(searchLower) ||
      postDate.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-base-100 to-base-200 min-h-screen min-w-[515px]">
      {/* Tab Navigation */}
      <div className="flex justify-center mb-6 sm:mb-8 gap-2 ">
        <div className="rounded-lg bg-base-300 p-1 flex gap-2">
          <button
            className={`tab tab-md sm:tab-lg rounded-lg ${
              activeTab === "published"
                ? "tab-active bg-[#FFB800] text-black hover:text-black"
                : "hover:bg-base-200 "
            }`}
            onClick={() => setActiveTab("published")}
          >
            <svg
              className="w-4 h-4 mr-2 "
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>Published ({filteredApprovedPosts.length})</span>
          </button>
          <button
            className={`tab tab-md sm:tab-lg rounded-lg ${
              activeTab === "pending"
                ? "tab-active bg-[#FFB800] text-black hover:text-black"
                : "hover:bg-base-200 "
            }`}
            onClick={() => setActiveTab("pending")}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>Pending ({pendingPosts.length})</span>
          </button>
        </div>
      </div>
      <div className="mb-6 sm:mb-8 flex justify-center">
        <div className="relative w-full max-w-lg">
          {activeTab == "published" && (
            <>
              <input
                type="text"
                placeholder="Search your posts by title or content..."
                className="input input-bordered w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                className="w-5 h-5 absolute top-1/2 left-3 transform -translate-y-1/2 text-base-content/40 z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fadeIn">
        {activeTab === "published" && (
          <div>
            <div className="flex items-center mb-6">
              <div className="w-1 h-8 bg-success rounded-full mr-2 sm:mr-4"></div>
              <h2 className="text-lg sm:text-xl font-semibold text-base-content">
                Your Published Posts
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-[#FFB800]/30 to-transparent ml-2 sm:ml-4"></div>
            </div>

            {filteredApprovedPosts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredApprovedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border "
                  >
                    <div className="card-body p-4 sm:p-6">
                      <div className="flex">
                        <h3
                          className="card-title text-base sm:text-lg mb-3 text-base-content line-clamp-2 hover:underline cursor-pointer "
                          onClick={() => {
                            navigate(`/dashboard/forum-detail/${post.id}`, {
                              state: { post, from: "/dashboard/user-posts" },
                            });
                          }}
                        >
                          {post.title}
                        </h3>
                      </div>
                      <p className="mt-2 text-gray-400 text-sm sm:text-base  line-clamp-3 sm:line-clamp-none">
                        {post.content && post.content.length > 150
                          ? post.content.slice(0, 150) + "..."
                          : post.content}
                      </p>
                      <div className="flex items-center text-xs sm:text-sm text-base-content/60 mb-4">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          ></path>
                        </svg>
                        {new Date(post.date_created).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </div>

                      <div className="card-actions justify-end mt-auto">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center gap-2 text-sm sm:text-base  ">
                            {post.comment_count}
                            <img
                              src={commentIcon}
                              alt="Comment"
                              className="w-2 h-2 sm:w-5 sm:h-5 lg:w-6 lg:h-6 hover:opacity-80"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-base-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10 text-base-content/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                </div>
                <p className="text-base sm:text-lg text-base-content/60">
                  No published posts found.
                </p>
                <p className="text-xs sm:text-sm text-base-content/40 mt-2">
                  Start creating content to see your published posts here!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "pending" && (
          <div>
            <div className="flex items-center mb-6">
              <div className="w-1 h-8 bg-warning rounded-full mr-2 sm:mr-4"></div>
              <h2 className="text-lg sm:text-xl font-semibold text-base-content">
                Awaiting Approval
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-[#FFB800]/30 to-transparent ml-2 sm:ml-4"></div>
            </div>

            {pendingPosts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingPosts.map((post) => (
                  <div
                    key={post.id}
                    className="card bg-base-100 shadow-lg  transition-all duration-300 border border-warning/20 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 "></div>

                    <div className="card-body p-4 sm:p-6">
                      <h3 className="card-title text-base sm:text-lg mb-3 text-base-content line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-base-content/70 mt-2 line-clamp-3">
                        {post.content}
                      </p>

                      <div className="flex items-center text-xs sm:text-sm text-base-content/60 mb-4">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                        Submitted{" "}
                        {new Date(post.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>

                      <div className="card-actions justify-end mt-auto">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center text-xs text-warning">
                            <div className="w-3 h-3 mr-1.5 bg-warning rounded-full animate-pulse"></div>
                            Under Review
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10 text-success"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <p className="text-base sm:text-lg text-base-content/60">
                  All clear! No posts waiting for review.
                </p>
                <p className="text-xs sm:text-sm text-base-content/40 mt-2">
                  Your submissions will appear here while awaiting approval.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPosts;
