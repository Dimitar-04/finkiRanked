import apiClient from "./apiClient";

export const getTaskForDate = async () => {
  return await apiClient.get(`/task`);
};
export const getTasksForForumPost = async () => {
  return await apiClient.get("/task/forum-post");
};
export const getTestCaseForTask = async (taskId) => {
  return await apiClient.get(`/task/${taskId}/test-case`);
};
export const getAllTestCasesForTask = async (taskId) => {
  return await apiClient.get(`/task/${taskId}/test-cases`);
};
export const getSpecificTestCase = async (testCaseId) => {
  return await apiClient.get(`task/test-cases/${testCaseId}`);
};
export const updateUserDailyTestCaseId = async (userId, testCaseId) => {
  return await apiClient.put(`task/users/${userId}/daily-test-case-id`, {
    testCaseId,
  });
};

export const createNewTask = async (taskData) => {
  return await apiClient.post(`/task/create`, taskData);
};

export const getAllTasks = async (page = 1, pageSize = 10) => {
  return await apiClient.get(`/task/all?page=${page}&pageSize=${pageSize}`);
};

export const searchTaskByDate = async (date) => {
  return await apiClient.get(`/task/search?date=${date}`);
};

export const deleteTask = async (taskId) => {
  return await apiClient.delete(`/task/${taskId}`);
};

export const evaluate = async (taskId, userOutput, testCaseId, userId) => {
  return await apiClient.post(`/task/${taskId}/evaluate`, {
    userOutput,
    testCaseId,
    userId,
  });
};
