import Navbar from "@/Dashboard/components/Navbar";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import RankBadge from "../../utils/RankBadge";

const LeaderBoardEx = () => {
  const [landing, setLanding] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      setLanding(true);
    } else if (location.pathname === "/dashboard/leaderboard") {
      setLanding(false);
    }
  }, [location.pathname]);

  const fetchLeaderboard = async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }functions/v1/leaderboard?page=${page}&limit=20`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.message || "Failed to fetch leaderboard");
      }

      if (append) {
        setLeaderboard((prev) => [...prev, ...data.leaderboard]);
      } else {
        setLeaderboard(data.leaderboard);
        setCurrentPage(page);
      }

      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(1, false);
  }, []);

  const handleLoadMore = () => {
    if (pagination && pagination.hasNextPage) {
      fetchLeaderboard(pagination.nextPage, true);
    }
  };

  const getPosition = (index) => {
    return index + 1;
  };

  if (loading && leaderboard.length === 0) {
    return (
      <div data-theme="luxury" className="min-h-screen flex bg-base-100">
        <div className="flex w-full flex-col justify-center items-center p-4 sm:p-8 lg:p-20 gap-6 sm:gap-8 lg:gap-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center">
            Leaderboard
          </h1>
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  if (error && leaderboard.length === 0) {
    return (
      <div data-theme="luxury" className="min-h-screen flex bg-base-100">
        <div className="flex w-full flex-col justify-center items-center p-4 sm:p-8 lg:p-20 gap-6 sm:gap-8 lg:gap-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center">
            Leaderboard
          </h1>
          <div className="alert alert-error max-w-md">
            <span className="text-sm sm:text-base">{error}</span>
          </div>
          <button
            className="btn btn-sm sm:btn-md lg:btn-lg btn-tertiary"
            onClick={() => fetchLeaderboard(1, false)}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div data-theme="luxury" className="min-h-screen flex bg-base-100">
        <div className="flex w-full flex-col items-center p-4 sm:p-8 lg:p-20 gap-6 sm:gap-8 lg:gap-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center">
            Leaderboard
          </h1>
          <p className="text-sm sm:text-base text-center">
            Note: The leaderboard updates every 5 minutes
          </p>

          {pagination && (
            <div className="stats stats-vertical sm:stats-horizontal shadow">
              <div className="stat">
                <div className="stat-title text-center text-xs sm:text-sm">
                  Total Users
                </div>
                <div className="stat-value text-lg text-center sm:text-2xl lg:text-3xl">
                  {pagination.totalUsers}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title text-xs sm:text-sm">Showing</div>
                <div className="stat-value text-lg sm:text-2xl text-center lg:text-3xl">
                  {leaderboard.length}
                </div>
              </div>
            </div>
          )}

          <div className="w-full max-w-6xl px-2 sm:px-4">
            <div className="rounded-box border border-base-content/5 bg-base-100 overflow-x-auto">
              <table className="table table-xs sm:table-sm lg:table-md w-full">
                <thead>
                  <tr>
                    <th className="text-xs sm:text-sm">Rank</th>
                    <th className="text-xs sm:text-sm">Username</th>
                    <th className="text-xs sm:text-sm hidden sm:table-cell">
                      Rank Tier
                    </th>
                    <th className="text-xs sm:text-sm">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user, index) => (
                    <tr key={user.id} className="hover">
                      <th className="text-xs sm:text-sm">
                        {getPosition(index)}
                      </th>
                      <td className="font-medium text-xs sm:text-sm truncate max-w-24 sm:max-w-none">
                        {user.username}
                      </td>
                      <td className="hidden sm:table-cell">
                        <div>
                          <RankBadge rankName={user.rank} size="sm" />
                        </div>
                      </td>
                      <td className="font-mono font-bold text-xs sm:text-sm">
                        {user.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {error && leaderboard.length > 0 && (
            <div className="alert alert-warning max-w-md">
              <span className="text-sm sm:text-base">
                Error loading more data: {error}
              </span>
            </div>
          )}

          {pagination && pagination.hasNextPage && (
            <button
              className={`btn btn-sm sm:btn-md lg:btn-lg ${
                loadingMore ? "btn-disabled" : "btn-primary"
              }`}
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  <span className="hidden sm:inline">Loading...</span>
                </>
              ) : (
                "Load More"
              )}
            </button>
          )}

          {pagination && !pagination.hasNextPage && leaderboard.length > 0 && (
            <div className="text-center text-base-content/70">
              <p className="text-sm sm:text-base">
                You've reached the end of the leaderboard!
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LeaderBoardEx;
