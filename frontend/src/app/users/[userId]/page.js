"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function UserProfilePage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadProfile();
    loadUserPosts();
  }, [params.userId]);

  const loadProfile = async () => {
    try {
      const response = await api.getPublicProfile(params.userId);
      if (response.success) {
        setUser(response.data);
      } else {
        console.error("Failed to load profile:", response.message);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await api.getUserPosts(params.userId, { limit: 50 });
      if (response.success) {
        setPosts(response.data);
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setPostsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">User not found</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user.username}
              </h1>
              {user.isVerified && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 mb-3">
                  ✓ Verified
                </span>
              )}
              <p className="text-gray-600 mb-4">{user.bio || "No bio yet"}</p>
              <div className="flex gap-6 text-sm text-gray-600">
                <div>
                  <span className="font-semibold text-gray-900">
                    {user._count.posts}
                  </span>{" "}
                  {user._count.posts === 1 ? "Post" : "Posts"}
                </div>
                <div>
                  <span className="font-semibold text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>{" "}
                  Joined
                </div>
              </div>
            </div>

            {currentUser && currentUser.id !== user.id && (
              <button
                onClick={() => router.push(`/chat/new?user=${user.id}`)}
                className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700">
                Message
              </button>
            )}
          </div>
        </div>

        {/* User's Posts Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {user.username}'s Posts
          </h2>

          {postsLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
              <p className="text-gray-500">
                {user.username} hasn't created any posts yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {post.description}
                      </p>
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
