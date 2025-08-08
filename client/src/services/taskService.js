import apiClient from './apiClient';

export const getTaskForDate = async () => {
  return await apiClient.get(`/task/today`);
};
export const getTasksForForumPost = async () => {
  return await apiClient.get('/task/forum-post');
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

export const getChallenges = async (page, limit, filters = null) => {
  page = Number(page) || 0;
  limit = Number(limit) || 20;
  const timestamp = new Date().getTime();
  let url = `/task?page=${page}&limit=${limit}&_t=${timestamp}`;
  const defaultFilters = {
    searchText: '',
    dateSort: 'newest',
    selectedDate: '',
  };
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value && value.toString() !== defaultFilters[key].toString()) {
        url += `&${key}=${value}`;
      }
    }
  }

  return await apiClient.get(url.toString());
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
