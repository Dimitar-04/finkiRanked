import apiClient from "./apiClient";

export const getForumPosts = async (page, limit, filters = null) => {
  // Force clean parameters
  page = Number(page) || 0;
  limit = Number(limit) || 20;
  
  // Add timestamp to prevent caching
  const timestamp = new Date().getTime();
  let url = `/forum/posts?page=${page}&limit=${limit}&_t=${timestamp}`;
  
  // Add filters to the URL if they exist
  if (filters) {
    console.log("Service processing filters:", JSON.stringify(filters));
    
    // Add topic filter - make sure it's really topic=daily-challenge, not topic=daily%2Dchallenge
    if (filters.topic && filters.topic !== 'all') {
      console.log(`Adding topic filter: ${filters.topic}`);
      url += `&topic=${filters.topic}`;
    }
    
    // Add sort filter - always include date sort preference
    if (filters.dateSort) {
      console.log(`Adding date sort filter: ${filters.dateSort}`);
      url += `&sort=${filters.dateSort}`;
      
      // Log the expected behavior
      if (filters.dateSort === 'oldest') {
        console.log("Expecting posts sorted with oldest first");
      } else {
        console.log("Expecting posts sorted with newest first");
      }
    }
    
    // Add specific date filter
    if (filters.selectedDate) {
      try {
        // Ensure we have a proper Date object
        const dateObj = filters.selectedDate instanceof Date ? 
          filters.selectedDate : 
          new Date(String(filters.selectedDate));
          
        // Validate the date before proceeding
        if (!isNaN(dateObj.getTime())) {
          const formattedDate = dateObj.toISOString().split('T')[0];
          console.log(`Adding specific date filter: ${formattedDate}`);
          url += `&date=${formattedDate}`;
          
          // Log combined filter details when using specific date with other filters
          if (filters.topic && filters.topic !== 'all') {
            console.log(`COMBINED FILTERS: Topic=${filters.topic} with specific date=${formattedDate}`);
          }
          
          if (filters.commentSort && filters.commentSort !== 'none') {
            console.log(`COMBINED FILTERS: Specific date=${formattedDate} with ${filters.commentSort} sorting`);
          }
          
          if (filters.dateSort === 'oldest') {
            console.log(`COMBINED FILTERS: Specific date=${formattedDate} with oldest-first sorting`);
            console.log('NOTE: When using specific date, time-of-day ordering still applies');
          }
        } else {
          console.error("Invalid date object:", filters.selectedDate);
        }
      } catch (err) {
        console.error("Error formatting date:", err, filters.selectedDate);
      }
    }
    
    // Add comment sort filter
    if (filters.commentSort && filters.commentSort !== 'none') {
      console.log(`Adding comment sort filter: ${filters.commentSort}`);
      url += `&commentSort=${filters.commentSort}`;
      
      // Add debug info about the expected effect
      if (filters.commentSort === 'most-popular') {
        console.log("Expecting posts sorted by highest comment count first");
      } else if (filters.commentSort === 'least-popular') {
        console.log("Expecting posts sorted by lowest comment count first");
      }
      
      // Log the combined filter details
      if (filters.topic && filters.topic !== 'all') {
        console.log(`COMBINED FILTERS: Topic=${filters.topic} with ${filters.commentSort} sorting`);
        console.log(`Expected behavior: First filter by ${filters.topic}, then sort by comment count`);
      }
    }

    // Add text search filter
    if (filters.searchText && filters.searchText.trim()) {
      const searchTerm = encodeURIComponent(filters.searchText.trim());
      console.log(`Adding text search filter: "${filters.searchText.trim()}"`);
      url += `&search=${searchTerm}`;
      
      // Log combined filter details when using search with other filters
      if (filters.topic && filters.topic !== 'all') {
        console.log(`COMBINED FILTERS: Topic=${filters.topic} with text search="${filters.searchText.trim()}"`);
      }
      
      if (filters.selectedDate) {
        console.log(`COMBINED FILTERS: Text search="${filters.searchText.trim()}" with specific date filtering`);
      }
    }
  }
  
  console.log("Making API request to:", url);
  
  try {
    // Use apiClient to ensure authentication works properly
    const apiResponse = await apiClient.get(url);
    
    // We'll only use this log to see what's coming from the API
    console.log(`API topic filter analysis:`, {
      requestedFilter: filters && filters.topic ? filters.topic : 'all',
      receivedPosts: apiResponse ? apiResponse.length : 0,
      postsWithRequestedTopic: apiResponse ? apiResponse.filter(p => 
        (filters && filters.topic && filters.topic !== 'all') ? 
        p.topic === filters.topic : true
      ).length : 0
    });
    
    // Check sorting accuracy and filtering correctness
    if (apiResponse && apiResponse.length > 1) {
      // 1. Check specific date filtering accuracy if applied
      if (filters && filters.selectedDate) {
        try {
          // Ensure we have a proper Date object
          const filterDate = filters.selectedDate instanceof Date ? 
            new Date(filters.selectedDate) : 
            new Date(String(filters.selectedDate));
            
          // Only proceed if we have a valid date
          if (!isNaN(filterDate.getTime())) {
            filterDate.setHours(0, 0, 0, 0); // Normalize to start of day
            
            const nextDay = new Date(filterDate);
            nextDay.setDate(nextDay.getDate() + 1);
            
            // Check if all posts are from the selected date
            const invalidDatePosts = apiResponse.filter(post => {
              try {
                const postDate = new Date(post.date_created);
                return postDate < filterDate || postDate >= nextDay;
              } catch (err) {
                console.error("Error parsing post date:", post.date_created);
                return true; // Count as invalid if we can't parse the date
              }
            });
            
            if (invalidDatePosts.length > 0) {
              console.log(`⚠️ SPECIFIC DATE FILTER ISSUE: Found ${invalidDatePosts.length} posts outside selected date range`);
              console.log('First mismatched post:', {
                id: invalidDatePosts[0].id,
                date: new Date(invalidDatePosts[0].date_created).toISOString(),
                expectedDate: filterDate.toISOString().split('T')[0]
              });
            } else {
              console.log(`✓ Specific date filter applied correctly: All posts are from ${filterDate.toISOString().split('T')[0]}`);
            }
          } else {
            console.error("Invalid date object for filtering validation:", filters.selectedDate);
          }
        } catch (err) {
          console.error("Error validating date filtering:", err);
        }
      }
      
      // 2. Analyze comment popularity sorting
      if (filters && filters.commentSort && filters.commentSort !== 'none') {
        let isPopularitySorted = true;
        for (let i = 0; i < apiResponse.length - 1; i++) {
          if (filters.commentSort === 'most-popular') {
            if (apiResponse[i].comment_count < apiResponse[i + 1].comment_count) {
              isPopularitySorted = false;
              break;
            }
          } else if (filters.commentSort === 'least-popular') {
            if (apiResponse[i].comment_count > apiResponse[i + 1].comment_count) {
              isPopularitySorted = false;
              break;
            }
          }
        }
        
        console.log(`Popularity sort check (${filters.commentSort}): ${isPopularitySorted ? '✓ CORRECT' : '⚠️ NEEDS CLIENT FIXING'}`);
        
        if (!isPopularitySorted) {
          console.log('Will rely on client-side sorting for popularity');
        }
      } 
      
      // 3. Analyze date sorting (if comment sort is not active)
      else if (filters && filters.dateSort) {
        let isDateSorted = true;
        for (let i = 0; i < apiResponse.length - 1; i++) {
          const dateA = new Date(apiResponse[i].date_created).getTime();
          const dateB = new Date(apiResponse[i + 1].date_created).getTime();
          
          if (filters.dateSort === 'oldest') {
            if (dateA > dateB) {
              isDateSorted = false;
              break;
            }
          } else {
            // Newest first (default)
            if (dateA < dateB) {
              isDateSorted = false;
              break;
            }
          }
        }
        
        console.log(`Date sort check (${filters.dateSort}): ${isDateSorted ? '✓ CORRECT' : '⚠️ NEEDS CLIENT FIXING'}`);
        
        if (!isDateSorted) {
          console.log('Will rely on client-side sorting for date ordering');
        }
      }
      
      // Log first few posts with dates to help with debugging
      if (apiResponse.length > 0) {
        console.log("Date ordering check:", apiResponse.slice(0, 3).map(p => ({
          id: p.id,
          date: new Date(p.date_created).toISOString(),
          comments: p.comment_count
        })));
      }
    }
    
    console.log(`API response for ${url}:`, apiResponse ? apiResponse.length : 0, "posts");
    if (apiResponse && apiResponse.length > 0) {
      // Log a sample of topics to verify what we're getting
      const topicSample = apiResponse.slice(0, 3).map(p => ({id: p.id, topic: p.topic, title: p.title}));
      console.log("First 3 posts:", topicSample);
    }
    
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
