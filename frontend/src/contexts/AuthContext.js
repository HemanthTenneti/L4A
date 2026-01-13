"use client";

import { createContext, useContext, useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      console.log("Checking auth - Token found:", !!token);

      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Auth check successful, user:", data.data);
        setUser(data.data);
      } else if (response.status === 401) {
        // Token expired or invalid, try to refresh
        console.log("Token invalid, attempting refresh");
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Retry checkAuth with new token
          await checkAuth();
        } else {
          console.log("Refresh failed, clearing tokens");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      } else {
        console.log("Auth check failed, clearing tokens");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const newAccessToken = data.data?.accessToken;
        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          console.log("Token refreshed successfully");
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  };

  const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log("Login response:", data);

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Store tokens
    const token = data.data?.accessToken;
    if (!token) {
      throw new Error("No access token received from server");
    }

    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", data.data?.refreshToken || "");
    setUser(data.data.user);

    console.log(
      "Token stored in localStorage:",
      localStorage.getItem("accessToken")
    );

    return data.data;
  };

  const register = async (username, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    console.log("Register response:", data);

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    // Store tokens
    const token = data.data?.accessToken;
    if (!token) {
      throw new Error("No access token received from server");
    }

    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", data.data?.refreshToken || "");
    setUser(data.data.user);

    console.log(
      "Token stored in localStorage:",
      localStorage.getItem("accessToken")
    );

    return data.data;
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        checkAuth,
        setUser,
        refreshAccessToken,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
