import apiClient from './apiClient';

export const getForumPosts = async (page, limit, filters = null) => {
  // Force clean parameters
  page = Number(page) || 0;
  limit = Number(limit) || 20;

  // Add timestamp to prevent caching
  const timestamp = new Date().getTime();
  let url = `/forum/posts?page=${page}&limit=${limit}&_t=${timestamp}`;

  // Add filters to the URL if they exist
  if (filters) {
    // Add topic filter - make sure it's really topic=daily-challenge, not topic=daily%2Dchallenge
    if (filters.topic && filters.topic !== 'all') {
      url += `&topic=${filters.topic}`;
    }

    // Add sort filter - always include date sort preference
    if (filters.dateSort) {
      url += `&sort=${filters.dateSort}`;
    }

    // Add specific date filter
    if (filters.selectedDate) {
      try {
        // Ensure we have a proper Date object
        const dateObj =
          filters.selectedDate instanceof Date
            ? filters.selectedDate
            : new Date(String(filters.selectedDate));

        if (!isNaN(dateObj.getTime())) {
          url += `&date=${dateObj}`;

          // Log combined filter details when using specific date with other filters
        } else {
          console.error('Invalid date object:', filters.selectedDate);
        }
      } catch (err) {
        console.error('Error formatting date:', err, filters.selectedDate);
      }
    }

    // Add comment sort filter
    if (filters.commentSort && filters.commentSort !== 'none') {
      url += `&commentSort=${filters.commentSort}`;
    }

    // Add text search filter
    if (filters.searchText && filters.searchText.trim()) {
      const searchTerm = encodeURIComponent(filters.searchText.trim());

      url += `&search=${searchTerm}`;
    }
  }

  try {
    // Use apiClient to ensure authentication works properly
    const apiResponse = await apiClient.get(url);

    return apiResponse;
  } catch (err) {
    console.error(`API error for ${url}:`, err);
    throw err;
  }
};

export const deleteForumPost = async (postId) => {
  return await apiClient.delete(`/forum/posts/${postId}`);
};
export const createForumPost = async (postData) => {
  return await apiClient.post('/forum/posts', postData);
};
export const getAllPostsByUser = async (page = 1, limit = 20, filters = {}) => {
  page = Number(page) || 1;
  limit = Number(limit) || 20;

  const timestamp = new Date().getTime();
  let url = `/forum/user-posts?page=${page}&limit=${limit}&_t=${timestamp}`;

  if (filters) {
    if (filters.topic && filters.topic !== 'all') {
      url += `&topic=${filters.topic}`;
    }

    if (filters.dateSort && filters.dateSort !== 'newest') {
      url += `&sort=${filters.dateSort}`;
    }
    if (filters.selectedDate) {
      const dateObj = new Date(String(filters.selectedDate));

      if (!isNaN(dateObj.getTime())) {
        url += `&date=${dateObj}`;
      }
    }
    if (filters.commentSort && filters.commentSort !== 'none') {
      url += `&commentSort=${filters.commentSort}`;
    }
    if (filters.searchText && filters.searchText.trim()) {
      url += `&search=${encodeURIComponent(filters.searchText.trim())}`;
    }
  }

  try {
    const apiResponse = await apiClient.get(url);
    return apiResponse;
  } catch (err) {
    console.error(`API error for ${url}:`, err);
    throw err;
  }
};
//Comment functions

export const getCommentsForPost = async (postId) => {
  return apiClient.get(`/forum/comments/${postId}`);
};
export const createComment = async (commentData) => {
  return apiClient.post('/forum/comments', commentData);
};
export const deleteComment = async (commentId) => {
  return apiClient.delete(`/forum/comments/${commentId}`);
};
