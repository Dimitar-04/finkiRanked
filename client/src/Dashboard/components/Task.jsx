import React, { useState } from 'react';
import Navbar from './Navbar';
import {useNavigate} from "react-router-dom";

const Task = () => {
  const [showTask, setShowTask] = useState(false);
  const today = new Date().toLocaleDateString();
  const user = JSON.parse(localStorage.getItem('user')) || { attempts: 0 };
  const navigate = useNavigate();
  const userOutput = document.getElementById('userOutput')?.value || '';

  function fetchTaskForToday(date) {

  }

  const handleStart = () => {
    fetchTaskForToday(Date.now());
    setShowTask(true);
  };
  function incrementAttempts(user) {
    const updatedUser = {
      ...user,
      attempts: (user.attempts || 0) + 1,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
  }
  function getMinutesSinceSevenAM(){
    const now = new Date();
    const sevenAM = new Date();
    sevenAM.setHours(7, 0, 0, 0); // Set to 7:00 AM today
    const diffMs = now.getTime() - sevenAM.getTime();
    return Math.floor(diffMs / (1000 * 60)); // Convert to full minutes
  }
  function getTimeBonus() {
    const minutes = getMinutesSinceSevenAM();
    return Math.max(0, 60 - Math.floor(minutes * 0.0833));
  }
  function getAttemptScore(user) {
    const attempts = user.attempts || 0;

    switch (attempts) {
      case 0: return 40;
      case 1: return 30;
      case 2: return 20;
      case 3: return 10;
      default: return 0;
    }
  }
  function resetAttempts(user) {
    const updatedUser = {
      ...user,
      attempts: 0,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
  }
  function calculateTotalScore(user) {
    return getTimeBonus() + getAttemptScore(user);
  }

  function incrementUserScore(user, score) {
    const updatedUser = {
      ...user,
      points: (user.points || 0) + score,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
  }

  function handleSubmit() {
    if(userOutput === testCase.output){
        incrementAttempts(user);
        const score = calculateTotalScore(user);
        incrementUserScore(user,score)
        alert(`Correct! Your score is ${score} and your total points are now ${user.points}`);
        resetAttempts(user);
        navigate('/dashboard/forum');
    }
    else{
        incrementAttempts(user);
        alert(`Incorrect! Try again`);
    }
  }


  return (
    <div
      data-theme="luxury"
      className="dashboard h-screen flex bg-base-100 overflow-none"
    >
      <Navbar></Navbar>
      <div className="container mx-auto max-w-4xl p-6" data-theme="luxury">
        {!showTask ? (
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body items-center text-center">
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
                    <ul className="list-disc list-inside space-y-2">
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
                  Start Challenge
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h1 className="card-title text-3xl">Challenge for {today}</h1>
              </div>

              <div className="card bg-base-300 mb-8">
                <div className="card-body">
                  <h2 className="card-title mb-4">Problem: String Reversal</h2>
                  <p className="text-lg leading-relaxed">
                    Write a function that takes a string as input and returns
                    its reverse. You must implement this manually without using
                    built-in reverse functions or shortcuts like Python's [::-1]
                    slicing.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="card bg-primary/5">
                  <div className="card-body">
                    <h3 className="card-title text-primary">Your Input</h3>
                    <div className="text-2xl font-mono mt-2">"ANDREJ"</div>
                    <p className="text-sm mt-2 text-base-content/70">
                      Use this input in your local editor
                    </p>
                  </div>
                </div>

                <div className="card bg-base-300">
                  <div className="card-body">
                    <h3 className="card-title">Example</h3>
                    <div className="space-y-2 mt-2">
                      <p className="font-mono">
                        Input: "hello" → Output: "olleh"
                      </p>
                      <p className="font-mono">
                        Input: "world" → Output: "dlrow"
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-300">
                <div className="card-body">
                  <h3 className="card-title mb-4">Submit Your Solution</h3>
                  <input
                      id="userOutput"
                    type="text"
                    placeholder="Enter your output here"
                    className="input input-bordered input-lg w-full mb-4"
                  />
                  <div className="card-actions justify-end">
                    <button className="btn border-amber-400 btn-lg" onClick={handleSubmit}>
                      Submit Solution
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Task;
