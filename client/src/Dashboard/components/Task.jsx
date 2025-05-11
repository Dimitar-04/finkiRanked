import React, { useState } from "react";

const Task = () => {
  const [showTask, setShowTask] = useState(false);
  const today = new Date().toLocaleDateString();

  const handleStart = () => {
    setShowTask(true);
  };

  return (
    <div
      className="flex flex-col items-center justify-center p-6 rounded-lg shadow-lg"
      data-theme="luxury"
    >
      {!showTask ? (
        <>
          <h1 className="text-4xl font-bold mb-4">The task for: {today}</h1>
          <p className="text-center mb-6 w-80">
            Welcome! Please make sure to follow the rules: Stay respectful, stay
            focused, and have fun!
            <br />
            <br />
            <strong>Note:</strong> The task will be available for 24 hours.
            <br />
            <br />
            <strong>Rules for grading:</strong>The task will be graded based on
            the time of submission.
            <br />
            <br />
            The earlier you submit, the better your score. Also the number of
            attempts will be taken into account.
            <br />
            <br />
            The more attempts you make, the worse your score will be.
          </p>
          <button
            onClick={handleStart}
            className="btn btn-active text-5xl px-14 py-10 mt-8 border rounded"
          >
            Start Now
          </button>
        </>
      ) : (
        <>
          <h1 className="text-4xl font-bold mb-6">Your Task</h1>
          <p className="text-center text-2xl mb-8">
            <strong>Solve the following problem:</strong> Reverse a string.In
            this task, you are required to write a function that takes a string
            as input and returns a new string that is the reverse of the
            original. For example, if the input string is "hello", the reversed
            version should be "olleh". Similarly, if the input is "world", the
            output should be "dlrow". However, you are not allowed to use any
            built-in functions or shortcuts like Python's slicing syntax
            ([::-1]) or the reverse() method. Instead, you should manually
            reverse the string using a loop, stack, or another approach that
            shows your understanding of how strings can be manipulated.{" "}
          </p>
          <div className=" p-4 rounded-lg mb-6">
            <p>
              Your unique input: <strong>ANDREJ</strong>
            </p>
            <p className="mt-3.5">
              Use this on your local code editor and paste the output below
            </p>
          </div>
          <div className="mb-8 border p-4 rounded-lg">
            <h2 className="text-3xl font-semibold">Example:</h2>
            <p className="text-xl">
              <strong>Input:</strong> "hello"
            </p>
            <p className="text-xl">
              <strong>Desired Output:</strong> "olleh"
            </p>
          </div>
          <div className="flex flex-col items-center">
            <input
              type="text"
              placeholder="Enter your solution"
              className="border p-4 mb-6 w-96 text-xl rounded-lg"
            />
            <button className="btn btn-action px-10 py-6 text-2xl rounded-lg">
              Submit
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Task;
