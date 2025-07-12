import apiClient from "./apiClient";

export const getForumPosts = async (page, limit) => {
  return await apiClient.get(`/forum/posts?page=${page}&limit=${limit}`);
};

export const deleteForumPost = async (postId) => {
  return await apiClient.delete(`/forum/posts/${postId}`);
};
export const createForumPost = async (postData) => {
  return await apiClient.post("/forum/posts", postData);
};
export const getAllPostsByUser = async () => {
  return await apiClient.get("/forum/user-posts");
};

//Comment functions

export const getCommentsForPost = async (postId) => {
  return apiClient.get(`/forum/comments/${postId}`);
};
export const createComment = async (commentData) => {
  return apiClient.post("/forum/comments", commentData);
};
export const deleteComment = async (commentId) => {
  return apiClient.delete(`/forum/comments/${commentId}`);
};
