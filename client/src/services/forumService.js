import apiClient from "./apiClient";

export const getForumPosts = (page, limit) => {
  return apiClient.get(`/forum/posts?page=${page}&limit=${limit}`);
};

export const deleteForumPost = (postId) => {
  return apiClient.delete(`/forum/posts/${postId}`);
};
export const createForumPost = (postData) => {
  return apiClient.post("/forum/posts", postData);
};

//Comment functions

export const getCommentsForPost = (postId) => {
  return apiClient.get(`/forum/comments/${postId}`);
};
export const createComment = (commentData) => {
  return apiClient.post("/forum/comments", commentData);
};
export const deleteComment = (commentId) => {
  return apiClient.delete(`/forum/comments/${commentId}`);
};
