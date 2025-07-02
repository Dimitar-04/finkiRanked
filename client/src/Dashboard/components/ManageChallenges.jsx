import React, { useEffect, useState } from "react";
import { getAllTasks, deleteTask } from "@/services/taskService";
import { useAuth } from "@/contexts/AuthContext";
const PAGE_SIZE = 10;

const ManageChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [expandedChallenge, setExpandedChallenge] = useState(null);
  const { user } = useAuth();
  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      try {
        const data = await getAllTasks(currentPage, PAGE_SIZE);
        setChallenges(data.challenges);
        console.log("Fetched challenges:", data.challenges);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error("Failed to fetch challenges:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, [currentPage]);
  const fetchTestCases = async (challengeId) => {
    try {
      setExpandedChallenge(
        expandedChallenge === challengeId ? null : challengeId
      );
    } catch (err) {
      console.error(
        `Failed to fetch test cases for challenge ${challengeId}:`,
        err
      );
    }
  };

  const deleteChallenge = async (challengeId) => {
    try {
      setLoading(true);
      console.log(challengeId);
      await deleteTask(challengeId);
      setChallenges(
        challenges.filter((challenge) => challenge.id !== challengeId)
      );
      console.log(`Challenge ${challengeId} deleted successfully.`);
    } catch (err) {
      console.error(`Failed to delete challenge ${challengeId}:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Manage Challenges</h1>
        <button className="btn border-amber-400 gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add New Challenge
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="space-y-6">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="card bg-base-200 shadow-md">
              <div className="card-body">
                <div className="flex justify-between items-center">
                  <h2 className="card-title text-xl font-bold">
                    {challenge.title
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </h2>
                  <div className="badge badge-tertiary p-4">
                    {new Date(challenge.solving_date).toLocaleDateString()}
                  </div>
                </div>

                <p className="text-base-content/80 mt-2 line-clamp-2">
                  {challenge.content}
                </p>

                {challenge.examples && challenge.examples.length > 0 && (
                  <div className="mt-4 card bg-base-300 p-3">
                    <h3 className="font-medium mb-2">Examples:</h3>
                    <div className="space-y-3">
                      {challenge.examples.map((example, index) => (
                        <div key={index} className="font-mono text-sm">
                          <p className="pl-2 border-l-2 border-amber-400 mt-1">
                            Input: "{example.input || "N/A"}" <br />
                            Output: "{example.output || "N/A"}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="card-actions justify-between mt-4">
                  <button
                    className="btn btn-sm btn-teritary"
                    onClick={() => fetchTestCases(challenge.id)}
                  >
                    {expandedChallenge === challenge.id
                      ? "Hide Test Cases"
                      : "Show Test Cases"}
                  </button>

                  <button
                    className="btn btn-sm btn-error btn-outline"
                    onClick={() => deleteChallenge(challenge.id)}
                  >
                    Delete
                  </button>
                </div>
                {expandedChallenge === challenge.id && challenge.test_cases && (
                  <div className="mt-4 card bg-base-300 p-3">
                    <h3 className="font-medium mb-2">Test Cases:</h3>
                    <div className="space-y-4 max-h-60 overflow-y-auto">
                      {challenge.test_cases.map((testCase, index) => (
                        <div key={testCase.id} className="card bg-base-100 p-3">
                          <h4 className="font-medium">Test Case {index + 1}</h4>
                          <div className="font-mono text-sm">
                            <div className="pl-2 border-l-2 border-amber-400 mt-1">
                              <p>Input:</p>
                              <pre className="bg-base-300 p-1 rounded">
                                {testCase.input || "N/A"}
                              </pre>
                            </div>
                            <div className="pl-2 border-l-2 border-green-400 mt-2">
                              <p>Expected Output:</p>
                              <pre className="bg-base-300 p-1 rounded">
                                {testCase.output || "N/A"}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: totalPages }, (_, idx) => (
          <button
            key={idx + 1}
            className={`btn btn-sm ${
              currentPage === idx + 1 ? "border-amber-400" : "btn-ghost"
            }`}
            onClick={() => setCurrentPage(idx + 1)}
            disabled={loading}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ManageChallenges;
