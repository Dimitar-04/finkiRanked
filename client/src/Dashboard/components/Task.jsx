import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import {
  getTaskForDate,
  getTestCaseForTask,
  evaluate,
  getSpecificTestCase,
  updateUserDailyTestCaseId,
} from "@/services/taskService";
const Task = () => {
  const [showTask, setShowTask] = useState(false);
  const [task, setTask] = useState(null);
  const [testCase, setTestCase] = useState(null);
  const [evalResult, setEvalResult] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toLocaleDateString();
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    const initialUser = storedUser ? JSON.parse(storedUser) : {};
    return {
      attempts: 0,
      daily_test_case_id: null,
      solvedDailyChallenge: false,
      points: 0,
      id: null,
      ...initialUser,
    };
  });

  useEffect(() => {
    if (currentUser && currentUser.id) {
      localStorage.setItem("user", JSON.stringify(currentUser));
    }
  }, [currentUser]);
  const navigate = useNavigate();

  useEffect(() => {
    if (task && task.id && showTask) {
      fetchTestCaseLogic(task.id);
    }
  }, [task, showTask]);

  async function fetchTaskForToday(date) {
    try {
      const formattedDate = new Date(date).toISOString().split("T")[0];
      const data = await getTaskForDate(formattedDate);

      if (Array.isArray(data) && data.length > 0) {
        const taskData = data[0];
        let processedTitle = taskData.title
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        setTask({
          id: taskData.id,
          title: processedTitle || "Daily Challenge",
          content: taskData.content || "No description available",
          examples: taskData.examples || [],
        });
      } else {
        setTask({
          title: "No Challenge Available",
          content: "There is no challenge available for today.",
          examples: [{ input: "N/A", output: "N/A" }],
        });
      }
    } catch (error) {
      console.error("Error fetching task:", error);
      setTask({
        title: "Error Loading Challenge",
        content:
          "There was an error loading today's challenge. Please try again later.",
        examples: [{ input: "N/A", output: "N/A" }],
      });
    }
  }

  async function fetchTestCaseLogic(challengeId) {
    try {
      let fetchedApiTestCaseData;
      let finalTestCaseIdToStore = null;

      if (currentUser.daily_test_case_id) {
        try {
          fetchedApiTestCaseData = await getSpecificTestCase(
            currentUser.daily_test_case_id
          );
          if (fetchedApiTestCaseData && fetchedApiTestCaseData.id) {
            finalTestCaseIdToStore = fetchedApiTestCaseData.id;
          } else {
            setCurrentUser((prev) => ({ ...prev, daily_test_case_id: null }));
          }
        } catch (specificFetchError) {
          console.warn(
            `Error fetching specific test case ${currentUser.daily_test_case_id}:`,
            specificFetchError
          );

          if (
            specificFetchError.response &&
            specificFetchError.response.status === 404
          ) {
            setCurrentUser((prev) => ({ ...prev, daily_test_case_id: null }));
          }
        }
      }

      if (!finalTestCaseIdToStore) {
        console.log("Fetching random test case for challenge:", challengeId);

        fetchedApiTestCaseData = await getTestCaseForTask(challengeId);
        if (fetchedApiTestCaseData && fetchedApiTestCaseData.id) {
          finalTestCaseIdToStore = fetchedApiTestCaseData.id;

          setCurrentUser((prev) => ({
            ...prev,
            daily_test_case_id: finalTestCaseIdToStore,
          }));

          if (currentUser.id) {
            try {
              await updateUserDailyTestCaseId(
                currentUser.id,
                finalTestCaseIdToStore
              );
              console.log(
                "Successfully updated daily_test_case_id on backend."
              );
            } catch (error) {
              console.error(
                "Failed to update daily_test_case_id on backend:",
                error
              );
            }
          } else {
            console.warn(
              "User ID not available, cannot update daily_test_case_id on backend."
            );
          }
        } else {
          console.warn("No random test case found for the task:", challengeId);
        }
      }

      if (fetchedApiTestCaseData && fetchedApiTestCaseData.input) {
        setTestCase({
          id: fetchedApiTestCaseData.id,
          input: fetchedApiTestCaseData.input,
        });
      } else {
        console.error("No valid test case data to set after fetch attempts.");
        setTestCase(null);
      }
    } catch (error) {
      console.error("Error in fetchTestCaseLogic (outer try):", error);
      setTestCase(null);
    }
  }

  const handleStart = () => {
    const today = new Date();
    fetchTaskForToday(today);

    setShowTask(true);
  };

  async function handleSubmitSolution() {
    if (!task || !task.examples || task.examples.length === 0) {
      alert("No challenge is currently available");
      return;
    }
    setIsSubmitting(true);

    try {
      const userOutput = document.getElementById("userOutput").value;

      const result = await evaluate(
        task.id,
        userOutput,
        testCase.id,
        currentUser.id
      );

      if (result.success) {
        setEvalResult(
          `${result.message} You earned ${result.scoreAwarded} points. Your total points are now ${result.newTotalPoints}.`
        );
        setIsCorrect(true);

        setCurrentUser((prev) => ({
          ...prev,
          points: result.newTotalPoints,
          solvedDailyChallenge: true,
          daily_points: result.scoreAwarded,
          rank: result.rank,
        }));
      } else {
        setEvalResult(
          `${result.message} This was attempt: ${result.attemptsMade}.`
        );
        setIsCorrect(false);

        setCurrentUser((prev) => ({
          ...prev,
          attempts: result.attemptsMade,
        }));
      }
    } catch (error) {
      console.error("Error evaluating solution:", error);
      alert("Something went wrong. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div data-theme="luxury" className="dashboard h-screen flex bg-base-100">
      <Navbar />
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl p-6" data-theme="luxury">
          {!showTask ? (
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body items-center ">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h1 className="card-title text-4xl font-bold mb-6">
                  Task for {today}
                </h1>
                <div className="divider"></div>
                <div className="space-y-6 text-lg">
                  <div className="card bg-base-300 shadow-sm">
                    <div className="card-body">
                      <h2 className="card-title">Rules for Grading</h2>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Earlier submissions receive better scores</li>
                        <li>Multiple attempts will reduce your score</li>
                        <li>Stay respectful and focused</li>
                        <li>Have fun solving the problem!</li>
                      </ul>
                    </div>
                  </div>
                  <div className="alert">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="w-6 h-6 stroke-current"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span>The task will be available for 24 hours</span>
                  </div>
                </div>

                <div className="card-actions justify-center mt-8">
                  <button
                    onClick={handleStart}
                    className="btn btn-lg border-amber-400 gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 3l14 9-14 9V3z" />
                    </svg>
                    {currentUser.solvedDailyChallenge
                      ? "View Challenge"
                      : "Start Challenge"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-4 mb-8">
                  <h1 className="card-title text-3xl text-left flex-1">
                    Challenge for {today}
                  </h1>
                </div>

                {currentUser.solvedDailyChallenge && (
                  <div className="alert alert-info mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="w-6 h-6 stroke-current"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span>
                      You have already completed today's challenge. Come back
                      tomorrow at 7 AM for a new challenge!
                    </span>
                  </div>
                )}

                {task ? (
                  <>
                    <div className="card bg-base-300 mb-2">
                      <div className="card-body">
                        <h2 className="card-title mb-1">
                          Problem: {task.title || "Daily Challenge"}
                        </h2>
                        <p className="text-lg leading-relaxed">
                          {task.content || "No description available"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6 mb-8">
                      <div className="card bg-primary/5">
                        <div className="card-body">
                          <h3 className="card-title text-seondary underline">
                            Your Input:
                          </h3>
                          <div
                            className={`text-xl font-mono mt-3 break-words font-bold ${
                              testCase &&
                              testCase.input &&
                              testCase.input.includes("\n")
                                ? "whitespace-pre-line"
                                : "whitespace-normal"
                            }`}
                          >
                            {testCase && testCase.input}
                          </div>
                        </div>
                      </div>

                      <div className="card bg-base-300">
                        <div className="card-body">
                          <h3 className="card-title">Example</h3>
                          <div className="space-y-2 mt-2">
                            {task.examples.map((element, index) => {
                              return (
                                <p className="font-mono break-all" key={index}>
                                  Input: "{element.input}" → Output: "
                                  {element.output}"
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-center items-center py-12">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                )}

                <div className="card bg-base-300">
                  <div className="card-body">
                    <h3 className="card-title mb-4">Submit Your Solution</h3>
                    <textarea
                      id="userOutput"
                      type="text"
                      placeholder={
                        currentUser.solvedDailyChallenge
                          ? "Challenge already completed"
                          : "Enter your output here..."
                      }
                      className={`textarea textarea-bordered textarea-lg w-full mb-4 ${
                        isCorrect === null
                          ? ""
                          : isCorrect
                          ? "border-green-500"
                          : "border-red-500"
                      }`}
                      rows="6"
                      disabled={
                        currentUser.solvedDailyChallenge || isSubmitting
                      }
                    />
                    {currentUser.solvedDailyChallenge && (
                      <p className="text-lg text-success">
                        You earned: {currentUser.daily_points} for today's task
                      </p>
                    )}

                    {isSubmitting && (
                      <div className="flex justify-center items-center my-2">
                        <span className="loading loading-spinner loading-md mr-2"></span>
                        <span>Evaluating your solution...</span>
                      </div>
                    )}

                    <p
                      className={`mt-2 mb-10 text-lg ${
                        isCorrect
                          ? "text-success"
                          : isCorrect === false
                          ? "text-error"
                          : ""
                      }`}
                    >
                      {evalResult}
                    </p>

                    <div className="card-actions justify-end gap-4">
                      <button
                        onClick={() => {
                          navigate("/dashboard/forum");
                        }}
                        className="btn border-amber-400 btn-lg"
                        disabled={isSubmitting}
                      >
                        Go Back
                      </button>
                      <button
                        onClick={() => handleSubmitSolution()}
                        className={`btn btn-lg ${
                          currentUser.solvedDailyChallenge || isSubmitting
                            ? "btn-disabled"
                            : "border-amber-400"
                        }`}
                        disabled={
                          currentUser.solvedDailyChallenge || isSubmitting
                        }
                      >
                        {isSubmitting ? (
                          <span className="loading loading-spinner"></span>
                        ) : currentUser.solvedDailyChallenge ? (
                          "Already Completed"
                        ) : (
                          "Submit Solution"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Task;
