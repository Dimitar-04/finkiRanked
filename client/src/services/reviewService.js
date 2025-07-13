import apiClient from "./apiClient";

export const getReviewPosts = async (page, limit, userId, search, date) => {
  const params = new URLSearchParams({
    page,
    limit,
    userId,
  });

  if (search) {
    params.append("search", search);
  }
  if (date) {
    const dateFormated = new Date(date);
    params.append("date", dateFormated.toISOString().split("T")[0]);
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
export const approveReviewPost = async (postId, postData, userId) => {
  return await apiClient.post(`/review/posts/${postId}/${userId}`, postData);
};

export const getPendingPosts = async () => {
  return await apiClient.get(`/review/pendingPosts`);
};
