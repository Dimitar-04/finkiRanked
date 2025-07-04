import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNewTask } from "@/services/taskService";
import { DatePicker } from "react-daisyui-timetools";
import "react-datepicker/dist/react-datepicker.css";
import "cally";
const CreateNewChallenge = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    type: "",
    errors: [],
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    output_type: "string",
    solving_date: new Date(),
  });

  const [examples, setExamples] = useState([
    { input: "", output: "" },
    { input: "", output: "" },
  ]);
  const [testCases, setTestCases] = useState([{ input: "", output: "" }]);
  const [currentTestCaseIndex, setCurrentTestCaseIndex] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleExampleChange = (index, field, value) => {
    const updatedExamples = [...examples];
    updatedExamples[index][field] = value;
    setExamples(updatedExamples);
  };
  const handleTestCaseChange = (index, field, value) => {
    const updatedTestCases = [...testCases];
    updatedTestCases[index][field] = value;
    setTestCases(updatedTestCases);
  };
  const addExample = () => {
    setExamples([...examples, { input: "", output: "" }]);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", output: "" }]);

    setCurrentTestCaseIndex(testCases.length - 1);
  };
  const nextTestCase = () => {
    if (currentTestCaseIndex < testCases.length - 1) {
      setCurrentTestCaseIndex(currentTestCaseIndex + 1);
    }
  };

  const prevTestCase = () => {
    if (currentTestCaseIndex > 0) {
      setCurrentTestCaseIndex(currentTestCaseIndex - 1);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // if (testCases.length < 10) {
      //   showModal(
      //     "Please add at least 10 test cases for your challenge.",
      //     "error"
      //   );
      //   setLoading(false);
      //   return;
      // }

      const hasEmptyTestCase = testCases.some(
        (tc) => !tc.input.trim() || !tc.output.trim()
      );
      if (hasEmptyTestCase) {
        showModal(
          "All test cases must have both input and output values.",
          "error"
        );
        setLoading(false);
        return;
      }

      const hasEmptyExample = examples.some(
        (ex) => !ex.input.trim() || !ex.output.trim()
      );
      if (hasEmptyExample) {
        showModal(
          "All examples must have both input and output values.",
          "error"
        );
        setLoading(false);
        return;
      }

      const challengeData = {
        ...formData,
        examples,
        testcases: testCases,
      };

      await createNewTask(challengeData);
      showModal("Challenge created successfully!", "success");
    } catch (error) {
      console.error("Failed to create challenge:", error);

      let errorMessage = "Failed to create challenge. Please try again.";
      let errorDetails = [];

      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        if (
          error.response.data.errors &&
          Array.isArray(error.response.data.errors)
        ) {
          errorDetails = error.response.data.errors;
        }
      }

      showModal(errorMessage, "error", errorDetails);
    } finally {
      setLoading(false);
    }
  };

  const showModal = (message, type, errors = []) => {
    setModal({
      isOpen: true,
      message,
      type,
      errors,
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      message: "",
      type: "",
      errors: [],
    });
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Create New Challenge</h1>
        <button
          className="btn btn-outline"
          onClick={() => navigate("/dashboard/manage-challenges")}
        >
          Back to Challenges
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card bg-base-200 shadow-md p-6">
          <h2 className="text-xl font-semibold mb-10 text-amber-400">
            Basic Information
          </h2>

          <div className="form-control w-full mb-4">
            <span className="label-text font-medium mb-2 block">
              Challenge Title
            </span>

            <input
              type="text"
              name="title"
              placeholder="Enter the challenge title..."
              className="input input-bordered w-full bg-base-300"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-control w-full mb-4">
            <span className="font-medium mb-2 block">Description</span>
            <textarea
              name="description"
              placeholder="Provide a clear description of the challenge..."
              className="textarea textarea-bordered h-32 bg-base-300 w-full max-w-full box-border"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="form-control">
              <span className="label-text font-medium">Difficulty</span>

              <select
                name="difficulty"
                className="select select-bordered w-full bg-base-300"
                value={formData.difficulty}
                onChange={handleChange}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="form-control">
              <span className="label-text font-medium">Output Type</span>

              <select
                name="output_type"
                className="select select-bordered w-full bg-base-300"
                value={formData.output_type}
                onChange={handleChange}
              >
                <option value="string">String</option>
                <option value="integer">Integer</option>
                <option value="array">Array</option>
                <option value="boolean">Boolean</option>
                <option value="object">Object</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-10 form-control">
            <span className="label-text font-medium">Solving date</span>
            <div data-theme="luxury " className="rounded-box w-1/5">
              <DatePicker
                value={formData.solving_date}
                onChange={(date) =>
                  setFormData((prev) => ({ ...prev, solving_date: date }))
                }
                minDate={new Date()}
              />
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="card bg-base-200 shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-amber-400">
            Examples
          </h2>
          <p className="text-base-content/70 mb-4">
            Provide at least two examples to help users understand the
            challenge.
          </p>

          {examples.map((example, index) => (
            <div key={`example-${index}`} className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-amber-400">
                  Example {index + 1}
                </h3>
              </div>

              <div className="mb-4">
                <span className="block mb-2">Input</span>
                <textarea
                  className="textarea textarea-bordered w-full h-20 font-mono bg-base-300 border-0"
                  placeholder="Example input..."
                  value={example.input}
                  onChange={(e) =>
                    handleExampleChange(index, "input", e.target.value)
                  }
                ></textarea>
              </div>

              <div>
                <span className="block mb-2">Expected Output</span>
                <textarea
                  className="textarea textarea-bordered w-full h-20 font-mono bg-base-300 border-0"
                  placeholder="Example output..."
                  value={example.output}
                  onChange={(e) =>
                    handleExampleChange(index, "output", e.target.value)
                  }
                ></textarea>
              </div>

              {index < examples.length - 1 && (
                <hr className="border-base-content/10 my-6" />
              )}
            </div>
          ))}

          <button
            type="button"
            className="btn border-amber-400 mt-4"
            onClick={addExample}
          >
            Add Example
          </button>
        </div>

        {/* Test Cases - Carousel Style */}
        <div className="card bg-base-200 shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-amber-400">Test Cases</h2>
            <div className="badge badge-neutral">
              {currentTestCaseIndex + 1} / {testCases.length}
            </div>
          </div>

          {/* Test Case Carousel */}
          <div className="relative">
            {testCases.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-amber-400">
                    Test Case {currentTestCaseIndex + 1}
                  </h3>
                </div>

                <div className="mb-4">
                  <span className="block mb-2">Input</span>
                  <textarea
                    className="textarea textarea-bordered w-full h-20 font-mono bg-base-300 border-0"
                    placeholder="Test input..."
                    value={testCases[currentTestCaseIndex].input}
                    onChange={(e) =>
                      handleTestCaseChange(
                        currentTestCaseIndex,
                        "input",
                        e.target.value
                      )
                    }
                  ></textarea>
                </div>

                <div>
                  <span className="block mb-2">Expected Output</span>
                  <textarea
                    className="textarea textarea-bordered w-full h-20 font-mono bg-base-300 border-0"
                    placeholder="Expected output..."
                    value={testCases[currentTestCaseIndex].output}
                    onChange={(e) =>
                      handleTestCaseChange(
                        currentTestCaseIndex,
                        "output",
                        e.target.value
                      )
                    }
                  ></textarea>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            {testCases.length > 1 && (
              <div className="flex justify-between mt-4 mb-2 font-bold">
                <button
                  type="button"
                  className="btn btn-circle btn-outline flex items-center justify-center text-2xl h-13 w-13"
                  onClick={prevTestCase}
                  disabled={currentTestCaseIndex === 0}
                >
                  ←
                </button>
                <button
                  type="button"
                  className="btn btn-circle btn-outline flex items-center justify-center text-2xl h-13 w-13"
                  onClick={nextTestCase}
                  disabled={currentTestCaseIndex === testCases.length - 1}
                >
                  →
                </button>
              </div>
            )}
          </div>

          {/* Carousel indicators */}
          {testCases.length > 1 && (
            <div className="flex justify-center gap-2 mt-4 mb-6">
              {testCases.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`w-2 h-2 rounded-full ${
                    currentTestCaseIndex === index
                      ? "bg-amber-400"
                      : "bg-base-300"
                  }`}
                  onClick={() => setCurrentTestCaseIndex(index)}
                  aria-label={`Go to test case ${index + 1}`}
                />
              ))}
            </div>
          )}

          <div className="flex justify-center mt-4">
            <button
              type="button"
              className="btn border-amber-400"
              onClick={addTestCase}
            >
              Add Test Case
            </button>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            type="submit"
            className="btn btn-tertiary border-amber-400 min-w-32"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Create Challenge"
            )}
          </button>
        </div>
      </form>
      {modal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50 backdrop-blur-xs"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-base-200 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              {modal.type === "success" && (
                <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center shrink-0">
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
              {modal.type === "error" && (
                <div className="w-8 h-8 rounded-full bg-error flex items-center justify-center shrink-0">
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
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              )}
              <h3 className="font-bold text-lg" id="modal-title">
                {modal.type === "success" ? "Success!" : "Error"}
              </h3>
            </div>
            <p className="py-4">{modal.message}</p>

            {modal.errors && modal.errors.length > 0 && (
              <div className="mt-4 p-3 bg-base-300 rounded-lg">
                <h4 className="font-semibold mb-2">Issues that need fixing:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {modal.errors.map((error, index) => (
                    <li key={index} className="text-sm text-error">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button className="btn border-amber-400" onClick={closeModal}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateNewChallenge;
