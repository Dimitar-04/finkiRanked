import apiClient from "./apiClient";

export const getReviewPosts = async (page, limit, userId) => {
  return await apiClient.get(
    `/review/posts?page=${page}&limit=${limit}&userId=${userId}`
  );
};
export const deleteReviewPost = async (postId, userId) => {
  return await apiClient.delete(`/review/posts/${postId}/${userId}`);
};

export const createApprovalForumPost = (postData) => {
  return apiClient.post("/review/posts/approval", postData);
};
export const approveReviewPost = async (postId, postData, userId) => {
  return await apiClient.post(`/review/posts/${postId}/${userId}`, postData);
};
