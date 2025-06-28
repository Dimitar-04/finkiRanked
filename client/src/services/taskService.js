import apiClient from "./apiClient";

export const getTaskForDate = async () => {
  return await apiClient.get(`/task`);
};

export const getTestCaseForTask = async (taskId) => {
  return await apiClient.get(`/task/${taskId}/test-case`);
};
export const getSpecificTestCase = async (testCaseId) => {
  return await apiClient.get(`task/test-cases/${testCaseId}`);
};
export const updateUserDailyTestCaseId = async (userId, testCaseId) => {
  return await apiClient.put(`task/users/${userId}/daily-test-case-id`, {
    testCaseId,
  });
};

export const evaluate = async (taskId, userOutput, testCaseId, userId) => {
  return await apiClient.post(`/task/${taskId}/evaluate`, {
    userOutput,
    testCaseId,
    userId,
  });
};
