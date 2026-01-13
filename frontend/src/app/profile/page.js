"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setBio(user.bio || "");
      loadUserPosts();
    }
  }, [user]);

  const loadUserPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await api.getPosts({ limit: 100 });
      if (response.success) {
        // Filter posts by current user
        const myPosts = response.data.filter(post => post.userId === user.id);
        setUserPosts(myPosts);
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleUpdateProfile = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.updateProfile({
        username,
        bio: bio || undefined,
      });

      if (response.success) {
        setSuccess("Profile updated successfully");
        // Update the auth context
        if (setUser) {
          setUser(response.data);
        }
      } else {
        setError(response.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update profile error:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Settings Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-800">
                {success}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Email (read-only)
                </label>
                <input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Your username"
                  minLength="3"
                  maxLength="50"
                />
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Tell us about yourself"
                  maxLength="500"
                  rows="4"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>

        {/* Your Posts Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Posts</h2>

          {postsLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : userPosts.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
              <p className="text-gray-500 mb-4">
                You haven&apos;t created any posts yet.
              </p>
              <Link
                href="/posts/new"
                className="inline-block rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700">
                Create Your First Post
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userPosts.map(post => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {post.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {post.description}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {post.category?.name || "General"}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            post.isOpen
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                          {post.isOpen ? "Open" : "Closed"}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
