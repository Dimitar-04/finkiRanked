import apiClient from "./apiClient";

export const getReviewPosts = async (page, limit, userId, filters) => {
  const params = new URLSearchParams({
    page,
    limit,
    userId,
  });

  if (filters) {
    if (filters.searchText) {
      params.append("search", filters.searchText);
    }
    if (filters.selectedDate) {
      const dateFormatted = new Date(filters.selectedDate);
      console.log("service", dateFormatted);
      params.append("date", dateFormatted);
    }
    if (filters.topic && filters.topic !== "all") {
      params.append("topic", filters.topic);
    }
    if (filters.dateSort) {
      params.append("dateSort", filters.dateSort);
    }
  }
  try {
    return await apiClient.get(`/review/posts?${params.toString()}`);
  } catch (error) {
    console.error("Error fetching posts for review:", error);
    throw error;
  }
};

export const deleteReviewPost = async (postId, userId) => {
  return await apiClient.delete(`/review/posts/${postId}/${userId}`);
};

export const createApprovalForumPost = async (postData) => {
  return await apiClient.post("/review/posts/approval", postData);
};
export const discardApprovalForumPost = async (userId) => {
  return await apiClient.put(`/review/posts/approval/${userId}`);
};
export const approveReviewPost = async (postId, postData, userId) => {
  return await apiClient.post(`/review/posts/${postId}/${userId}`, postData);
};

export const getPendingPosts = async () => {
  return await apiClient.get(`/review/pendingPosts`);
};
