import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';

const Task = () => {
  const [showTask, setShowTask] = useState(false);
  const [task, setTask] = useState(null);
  const [testCase, setTestCase] = useState(null);
  const [evalResult, setEvalResult] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toLocaleDateString();
  const user = JSON.parse(localStorage.getItem('user')) || { attempts: 0 };
  const navigate = useNavigate();
  const token = localStorage.getItem('jwt');
  useEffect(() => {
    if (task && task.id) {
      fetchTestCaseForToday(task.id);
    }
  }, [task]);

  async function fetchTaskForToday(date) {
    try {
      const formattedDate = new Date(date).toISOString().split('T')[0];

      const response = await fetch(`/task/${formattedDate}`, {
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',

          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        throw new Error('Failed to parse server response as JSON' + error);
      }

      if (Array.isArray(data) && data.length > 0) {
        const taskData = data[0];
        console.log('Processing task data:', taskData);
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
        console.error('No tasks found for the date');
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

  function toggleSolvedDailyChallenge(user) {
    const updatedUser = {
      ...user,
      solvedDailyChallenge: true,
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  }

  async function fetchTestCaseForToday(id) {
    try {
      const response = await fetch(`/task/${id}/test-case`, {
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.input) {
        setTestCase({
          id: data.id,
          input: data.input,
        });
      } else {
        console.error('No test case found for the task');
        setTestCase(null);
      }
    } catch (error) {
      console.error('Error fetching test case:', error);
      setTestCase(null);
    }
  }

  const handleStart = () => {
    const today = new Date();
    fetchTaskForToday(today);

    // toggleSolvedDailyChallenge(user);

    setShowTask(true);
  };

  async function handleSubmitSolution() {
    if (!task || !task.examples || task.examples.length === 0) {
      alert('No challenge is currently available');
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch(`/task/${task.id}/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userOutput: document.getElementById('userOutput').value,
          testCaseId: testCase.id,
          userId: user.id,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        // Handle HTTP errors (e.g., 400, 404, 500)
        // The 'result' might contain an error message from the backend
        console.error('Server error:', result);
        alert(
          `Error: ${
            result.message ||
            'Failed to evaluate solution. Status: ' + response.status
          }`
        );
        return;
      }
      if (result.success) {
        setEvalResult(
          `${result.message} You earned ${result.scoreAwarded} points. Your total points are now ${result.newTotalPoints}.`
        );
        setIsCorrect(true);

        const updatedUserFromStorage =
          JSON.parse(localStorage.getItem('user')) || {};
        updatedUserFromStorage.points = result.newTotalPoints;
        updatedUserFromStorage.solvedDailyChallenge = true;
        updatedUserFromStorage.pointsAwarded = result.scoreAwarded;

        toggleSolvedDailyChallenge(user);
        updatedUserFromStorage.rank = result.rank;
        localStorage.setItem('user', JSON.stringify(updatedUserFromStorage));

        // navigate('/dashboard/forum');
      } else {
        setEvalResult(
          `${result.message} This was attempt: ${result.attemptsMade}.`
        );
        setIsCorrect(false);

        const updatedUserFromStorage =
          JSON.parse(localStorage.getItem('user')) || {};
        updatedUserFromStorage.attempts = result.attemptsMade;
        localStorage.setItem('user', JSON.stringify(updatedUserFromStorage));
      }
    } catch (error) {
      console.error('Error evaluating solution:', error);
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
                    {user.solvedDailyChallenge
                      ? 'View Challenge'
                      : 'Start Challenge'}
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

                {user.solvedDailyChallenge && (
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
                          Problem: {task.title || 'Daily Challenge'}
                        </h2>
                        <p className="text-lg leading-relaxed">
                          {task.content || 'No description available'}
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
                            className={`text-xl font-mono mt-3 break-all font-bold ${
                              testCase &&
                              testCase.input &&
                              testCase.input.includes('\n')
                                ? 'whitespace-pre-line'
                                : 'whitespace-normal'
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
                        user.solvedDailyChallenge
                          ? 'Challenge already completed'
                          : 'Enter your output here...'
                      }
                      className={`textarea textarea-bordered textarea-lg w-full mb-4 ${
                        isCorrect === null
                          ? ''
                          : isCorrect
                          ? 'border-green-500'
                          : 'border-red-500'
                      }`}
                      rows="6"
                      disabled={user.solvedDailyChallenge || isSubmitting}
                    />
                    {user.solvedDailyChallenge && (
                      <p className="text-lg text-success">
                        You earned: {user.pointsAwarded} for today's task
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
                          ? 'text-success'
                          : isCorrect === false
                          ? 'text-error'
                          : ''
                      }`}
                    >
                      {evalResult}
                    </p>

                    <div className="card-actions justify-end gap-4">
                      <button
                        onClick={() => {
                          navigate('/dashboard/forum');
                        }}
                        className="btn border-amber-400 btn-lg"
                        disabled={isSubmitting}
                      >
                        Go Back
                      </button>
                      <button
                        onClick={() => handleSubmitSolution()}
                        className={`btn btn-lg ${
                          user.solvedDailyChallenge || isSubmitting
                            ? 'btn-disabled'
                            : 'border-amber-400'
                        }`}
                        disabled={user.solvedDailyChallenge || isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="loading loading-spinner"></span>
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
          )}
        </div>
      </div>
    </div>
  );
};
export default Task;
