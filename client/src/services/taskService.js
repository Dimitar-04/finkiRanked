import apiClient from "./apiClient";

export const getTaskForDate = async (date) => {
  return await apiClient.get(`/task/${date}`);
};

export const getTestCaseForTask = async (taskId) => {
  return await apiClient.get(`/task/${taskId}/test-case`);
};

export const evaluate = async (taskId, userOutput, testCaseId, userId) => {
  return await apiClient.post(`/task/${taskId}/evaluate`, {
    userOutput,
    testCaseId,
    userId,
  });
};
