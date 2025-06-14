/**
 * @param {string} url
 * @param {Object} options
 * @returns {Promise}
 */

//MOMENTALNO NE SE KORISTI

export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('jwt');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

/**
 * @param {Response} response
 * @returns {Promise}
 */

/**
 * Helper function for handling common response patterns
 * @param {Response} response - Fetch response object
 * @returns {Promise} - JSON response or error
 */
export const handleResponse = async (response) => {
  if (!response.ok) {
    // Handle session expiration
    if (response.status === 401 || response.status === 403) {
      // Optional: Redirect to login or refresh token
      // window.location.href = '/login';
    }

    // Try to parse error message from response
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`
    );
  }

  // For 204 No Content responses
  if (response.status === 204) {
    return null;
  }

  return response.json();
};
