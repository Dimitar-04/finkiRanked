import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  getTaskForDate,
  getTestCaseForTask,
  evaluate,
  getSpecificTestCase,
  updateUserDailyTestCaseId,
} from '@/services/taskService';

const Task = () => {
  const [showTask, setShowTask] = useState(false);
  const [task, setTask] = useState(null);
  const [testCase, setTestCase] = useState(null);
  const [evalResult, setEvalResult] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUserOutputEmpty, setIsUserOutputEmpty] = useState(true);

  const today = new Date().toLocaleDateString();
  const { user, updateUser, loading, isVerifying } = useAuth();

  useEffect(() => {
    if (task && task.id && showTask) {
      fetchTestCaseLogic(task.id);
    }
  }, [task, user]);
  useEffect(() => {
    if (user && !user.solvedDailyChallenge) {
      setIsCorrect(null);
      setEvalResult('');
      setIsUserOutputEmpty(true);
    }
  }, [user?.solvedDailyChallenge]);

  async function fetchTaskForToday() {
    try {
      const data = await getTaskForDate();

      if (Array.isArray(data) && data.length > 0) {
        const taskData = data[0];
        let processedTitle = taskData.title
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        setTask({
          id: taskData.id,
          title: processedTitle || 'Daily Challenge',
          content: taskData.content || 'No description available',
          examples: taskData.examples || [],
        });
      } else {
        setTask({
          title: 'No Challenge Available',
          content: 'There is no challenge available for today.',
          examples: [{ input: 'N/A', output: 'N/A' }],
        });
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      setTask({
        title: 'Error Loading Challenge',
        content:
          "There was an error loading today's challenge. Please try again later.",
        examples: [{ input: 'N/A', output: 'N/A' }],
      });
    }
  }

  async function fetchTestCaseLogic(challengeId) {
    try {
      let fetchedApiTestCaseData;
      let finalTestCaseIdToStore = null;

      if (user.daily_test_case_id) {
        try {
          fetchedApiTestCaseData = await getSpecificTestCase(
            user.daily_test_case_id
          );
          if (fetchedApiTestCaseData && fetchedApiTestCaseData.id) {
            finalTestCaseIdToStore = fetchedApiTestCaseData.id;
          } else {
            updateUser({ ...user, daily_test_case_id: null });
          }
        } catch (specificFetchError) {
          console.warn(
            `Error fetching specific test case ${user.daily_test_case_id}:`,
            specificFetchError
          );

          if (
            specificFetchError.response &&
            specificFetchError.response.status === 404
          ) {
            updateUser({ ...user, daily_test_case_id: null });
          }
        }
      }

      if (!finalTestCaseIdToStore) {
        fetchedApiTestCaseData = await getTestCaseForTask(challengeId);
        if (fetchedApiTestCaseData && fetchedApiTestCaseData.id) {
          finalTestCaseIdToStore = fetchedApiTestCaseData.id;

          updateUser({ ...user, daily_test_case_id: finalTestCaseIdToStore });

          if (user.id) {
            try {
              await updateUserDailyTestCaseId(user.id, finalTestCaseIdToStore);
            } catch (error) {
              console.error(
                'Failed to update daily_test_case_id on backend:',
                error
              );
            }
          } else {
            console.warn(
              'User ID not available, cannot update daily_test_case_id on backend.'
            );
          }
        } else {
          console.warn('No random test case found for the task:', challengeId);
        }
      }

      if (fetchedApiTestCaseData && fetchedApiTestCaseData.input) {
        setTestCase({
          id: fetchedApiTestCaseData.id,
          input: fetchedApiTestCaseData.input,
        });
      } else {
        console.error('No valid test case data to set after fetch attempts.');
        setTestCase(null);
      }
    } catch (error) {
      console.error('Error in fetchTestCaseLogic (outer try):', error);
      setTestCase(null);
    }
  }

  const handleStart = () => {
    if (!task) {
      fetchTaskForToday(today);
    }

    setShowTask(true);
  };

  async function handleSubmitSolution() {
    if (!task || !task.examples || task.examples.length === 0) {
      alert('No challenge is currently available');
      return;
    }
    setIsSubmitting(true);

    try {
      const userOutput = document.getElementById('userOutput').value;
      if (userOutput.trim() === '') {
        return;
      }
      const result = await evaluate(task.id, userOutput, testCase.id, user.id);

      if (result.success) {
        setEvalResult(
          `${result.message} You earned ${result.scoreAwarded} points. Your total points are now ${result.newTotalPoints}.`
        );
        setIsCorrect(true);

        updateUser({
          ...user,
          points: result.newTotalPoints,
          solvedDailyChallenge: true,
          daily_points: result.scoreAwarded,
          rank: result.rank,
        });
      } else {
        setEvalResult(
          `${result.message} This was attempt: ${result.attemptsMade}.`
        );
        setIsCorrect(false);

        updateUser({
          ...user,
          attempts: result.attemptsMade,
        });
      }
    } catch (error) {
      console.error('Error evaluating solution:', error);
      alert('Something went wrong. Try again later.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleGoBack = () => {
    setShowTask(false);
  };

  if (loading) {
    return (
      <div data-theme="luxury" className="dashboard h-screen flex bg-base-100">
        <div className="flex-1 flex justify-center items-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div data-theme="luxury" className="dashboard  flex bg-base-100">
      <div className="flex-1 overflow-y-auto flex items-center justify-center min-h-full">
        <div className="container mx-auto max-w-4xl p-6" data-theme="luxury">
          {!showTask ? (
            <div className="card bg-base-200 shadow-xl w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl  mx-auto">
              <div className="card-body items-center max-h-[90vh] ">
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
                  Challenge for {new Date().toLocaleDateString('en-GB')}
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
                    <span>The challenge will be available for 24 hours</span>
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
                    {user.solvedDailyChallenge
                      ? 'View Challenge'
                      : 'Start Challenge'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body p-3 sm:p-6 lg:p-8">
                  {/* Header Section */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
                    <h1 className="card-title text-xl sm:text-2xl lg:text-3xl text-left flex-1 break-words">
                      Challenge for {today}
                    </h1>
                  </div>

                  {/* Already Completed Alert */}
                  {user.solvedDailyChallenge && (
                    <div className="alert alert-info mb-3 sm:mb-4 text-sm sm:text-base">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="w-4 h-4 sm:w-6 sm:h-6 stroke-current shrink-0"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <span className="break-words">
                        You have already completed today's challenge. Come back
                        tomorrow at 7 AM for a new challenge!
                      </span>
                    </div>
                  )}

                  {task ? (
                    <>
                      {/* Problem Section */}
                      <div className="card bg-base-300 mb-3 sm:mb-4 lg:mb-6">
                        <div className="card-body p-3 sm:p-4 lg:p-6">
                          <h2 className="card-title text-lg sm:text-xl lg:text-2xl mb-2 sm:mb-3 underline break-words">
                            Problem: {task.title || 'Daily Challenge'}
                          </h2>
                          <p className="text-sm sm:text-base lg:text-lg leading-relaxed break-words font-bold whitespace-pre-line">
                            {task.content || 'No description available'}
                          </p>
                        </div>
                      </div>

                      {/* Input and Examples Section */}
                      <div className="space-y-3 sm:space-y-4 lg:space-y-6 mb-4 sm:mb-6 lg:mb-8">
                        {/* Your Input Card */}
                        <div className="card bg-primary/5">
                          <div className="card-body p-3 sm:p-4 lg:p-6">
                            <h3 className="card-title text-base sm:text-lg lg:text-xl underline mb-2 sm:mb-3">
                              Your Input:
                            </h3>
                            <div
                              className={`text-sm sm:text-base lg:text-lg xl:text-xl font-mono break-words max-h-32 sm:max-h-40 lg:max-h-48 overflow-y-auto font-bold p-2 sm:p-3 bg-base-100 rounded ${
                                testCase &&
                                testCase.input &&
                                testCase.input.includes('\n')
                                  ? 'whitespace-pre-line'
                                  : 'whitespace-normal'
                              }`}
                            >
                              {testCase &&
                                testCase.input &&
                                testCase.input.replace(/^"|"$/g, '')}
                            </div>
                          </div>
                        </div>

                        {/* Examples Card */}
                        <div className="card bg-base-300">
                          <div className="card-body p-3 sm:p-4 lg:p-6">
                            <h3 className="card-title text-base sm:text-lg lg:text-xl mb-2 sm:mb-3">
                              Examples:
                            </h3>
                            <div className="space-y-3 sm:space-y-4 lg:space-y-5">
                              {task.examples.map((example, index) => (
                                <div
                                  key={index}
                                  className="font-mono text-xs sm:text-sm lg:text-base break-words font-bold whitespace-pre-line bg-base-100 p-2 sm:p-3 rounded"
                                >
                                  <div className="pl-2 sm:pl-3 border-l-2 border-amber-400">
                                    <p className="mb-1 sm:mb-2">
                                      <span className="font-semibold">
                                        Input:
                                      </span>{' '}
                                      {example.input || 'N/A'}
                                    </p>
                                    <p>
                                      <span className=" font-semibold">
                                        Output:
                                      </span>{' '}
                                      {example.output || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-center items-center py-8 sm:py-12 lg:py-16">
                      <span className="loading loading-spinner loading-md sm:loading-lg"></span>
                    </div>
                  )}

                  {/* Submit Solution Section */}
                  <div className="card bg-base-300">
                    <div className="card-body p-3 sm:p-4 lg:p-6">
                      <h3 className="card-title text-base sm:text-lg lg:text-xl mb-3 sm:mb-4">
                        Submit Your Solution
                      </h3>

                      <textarea
                        id="userOutput"
                        type="text"
                        placeholder={
                          user.solvedDailyChallenge
                            ? 'Challenge already completed'
                            : 'Enter your output here...'
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          setIsUserOutputEmpty(value.trim() === '');
                        }}
                        className={`textarea textarea-bordered w-full mb-3 sm:mb-4 text-sm sm:text-base resize-none ${
                          isCorrect === null
                            ? ''
                            : isCorrect
                            ? 'border-green-500'
                            : 'border-red-500'
                        }`}
                        rows="4"
                        style={{ minHeight: '100px', maxHeight: '200px' }}
                        disabled={user.solvedDailyChallenge || isSubmitting}
                      />

                      {user.solvedDailyChallenge && (
                        <p className="text-sm sm:text-base lg:text-lg text-success mb-3 sm:mb-4">
                          You earned:{' '}
                          <span className="font-bold">{user.daily_points}</span>{' '}
                          points for today's task
                        </p>
                      )}

                      {isSubmitting && (
                        <div className="flex justify-center items-center my-2 sm:my-3 text-sm sm:text-base">
                          <span className="loading loading-spinner loading-sm sm:loading-md mr-2"></span>
                          <span>Evaluating your solution...</span>
                        </div>
                      )}

                      <p
                        className={`mb-4 sm:mb-6 lg:mb-8 text-sm sm:text-base lg:text-lg break-words ${
                          isCorrect
                            ? 'text-success'
                            : isCorrect === false
                            ? 'text-error'
                            : ''
                        }`}
                      >
                        {evalResult}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                        <button
                          onClick={() => {
                            handleGoBack();
                          }}
                          className="btn border-amber-400 btn-sm sm:btn-md lg:btn-lg order-2 sm:order-1"
                          disabled={isSubmitting}
                        >
                          Go Back
                        </button>
                        <button
                          onClick={() => handleSubmitSolution()}
                          className={`btn btn-sm sm:btn-md lg:btn-lg order-1 sm:order-2 ${
                            user.solvedDailyChallenge || isSubmitting
                              ? 'btn-disabled'
                              : 'border-amber-400'
                          }`}
                          disabled={
                            user.solvedDailyChallenge ||
                            isSubmitting ||
                            isUserOutputEmpty
                          }
                        >
                          {isSubmitting ? (
                            <span className="loading loading-spinner loading-xs sm:loading-sm"></span>
                          ) : user.solvedDailyChallenge ? (
                            'Already Completed'
                          ) : (
                            'Submit Solution'
                          )}
                        </button>
                      </div>
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
