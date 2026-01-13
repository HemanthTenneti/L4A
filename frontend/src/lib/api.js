const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchWithAuth(url, options = {}) {
  let token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    let response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    // Handle 401 - try to refresh token and retry
    if (response.status === 401) {
      console.log("Got 401, attempting token refresh");
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            const newAccessToken = refreshData.data?.accessToken;

            if (newAccessToken) {
              localStorage.setItem("accessToken", newAccessToken);
              console.log("Token refreshed, retrying request");

              // Retry the original request with new token
              headers["Authorization"] = `Bearer ${newAccessToken}`;
              response = await fetch(`${API_BASE_URL}${url}`, {
                ...options,
                headers,
              });
            }
          } else {
            // Refresh failed, logout user
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
            return { success: false, message: "Session expired" };
          }
        } catch (refreshError) {
          console.error("Refresh error:", refreshError);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return { success: false, message: "Session expired" };
        }
      } else {
        // No refresh token, logout
        localStorage.removeItem("accessToken");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return { success: false, message: "Session expired" };
      }
    }

    const data = await response.json();

    if (!response.ok) {
      console.error(`API Error [${response.status}] ${url}:`, data);
    }

    return data;
  } catch (error) {
    console.error(`API Fetch Error ${url}:`, error);
    throw error;
  }
}

export const api = {
  // Posts
  getPosts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/posts${queryString ? `?${queryString}` : ""}`);
  },

  getPost: async id => {
    return fetchWithAuth(`/posts/${id}`);
  },

  createPost: async postData => {
    return fetchWithAuth("/posts", {
      method: "POST",
      body: JSON.stringify(postData),
    });
  },

  updatePost: async (id, postData) => {
    return fetchWithAuth(`/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(postData),
    });
  },

  deletePost: async id => {
    return fetchWithAuth(`/posts/${id}`, {
      method: "DELETE",
    });
  },

  closePost: async id => {
    return fetchWithAuth(`/posts/${id}/close`, {
      method: "POST",
    });
  },

  respondToPost: async id => {
    return fetchWithAuth(`/posts/${id}/respond`, {
      method: "POST",
    });
  },

  // Categories
  getCategories: async () => {
    return fetchWithAuth("/categories");
  },

  // Chat
  getChatRoom: async id => {
    return fetchWithAuth(`/chats/${id}`);
  },

  getChatMessages: async (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(
      `/chats/${id}/messages${queryString ? `?${queryString}` : ""}`
    );
  },

  sendMessage: async (chatRoomId, message) => {
    return fetchWithAuth(`/chats/${chatRoomId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content: message }),
    });
  },

  getUserRooms: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(
      `/chats/rooms/my-rooms${queryString ? `?${queryString}` : ""}`
    );
  },

  leaveRoom: async chatRoomId => {
    return fetchWithAuth(`/chats/${chatRoomId}/leave`, {
      method: "POST",
    });
  },

  checkUserResponse: async postId => {
    return fetchWithAuth(`/posts/${postId}/check-response`);
  },

  // Auth
  updateProfile: async profileData => {
    return fetchWithAuth("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },

  // Notifications
  getNotifications: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(
      `/notifications${queryString ? `?${queryString}` : ""}`
    );
  },

  markNotificationAsRead: async notificationId => {
    return fetchWithAuth(`/notifications/${notificationId}/read`, {
      method: "PUT",
    });
  },

  deleteNotification: async notificationId => {
    return fetchWithAuth(`/notifications/${notificationId}`, {
      method: "DELETE",
    });
  },

  // Users
  getPublicProfile: async userId => {
    return fetchWithAuth(`/users/${userId}/profile`);
  },

  getUserPosts: async (userId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(
      `/users/${userId}/posts${queryString ? `?${queryString}` : ""}`
    );
  },
};
