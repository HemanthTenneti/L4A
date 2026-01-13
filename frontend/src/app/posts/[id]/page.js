"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function PostDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [userResponse, setUserResponse] = useState(null);
  const [checkingResponse, setCheckingResponse] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    loadPost();
    if (user) {
      checkUserResponse();
    }
  }, [params.id, user]);

  const loadPost = async () => {
    try {
      const response = await api.getPost(params.id);
      if (response.success) {
        console.log("Post data received:", response.data);
        console.log("Post userId:", response.data.userId);
        console.log("Current user:", user);
        setPost(response.data);
      }
    } catch (error) {
      console.error("Failed to load post:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserResponse = async () => {
    if (!user) return;

    try {
      setCheckingResponse(true);
      const response = await api.checkUserResponse(params.id);
      if (response.success) {
        setUserResponse(response.data);
      }
    } catch (error) {
      console.error("Failed to check user response:", error);
    } finally {
      setCheckingResponse(false);
    }
  };

  const handleRespond = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      setResponding(true);
      const response = await api.respondToPost(params.id);
      if (response.success) {
        // Redirect to chat room
        router.push(`/chat/${response.data.id}`);
      } else {
        const errorMsg = response.message || "Failed to respond to post";
        alert(errorMsg);
      }
    } catch (error) {
      console.error("Failed to respond:", error);
      alert("Failed to respond to post");
    } finally {
      setResponding(false);
    }
  };

  const handleClose = async () => {
    try {
      const response = await api.closePost(params.id);
      if (response.success) {
        loadPost();
      }
    } catch (error) {
      console.error("Failed to close post:", error);
      alert("Failed to close post");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const response = await api.deletePost(params.id);
      if (response.success) {
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Failed to delete post");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Post not found</p>
        </div>
      </div>
    );
  }

  const isOwner = user && String(user.id) === String(post.userId);
  console.log("isOwner check:", {
    userId: user?.id,
    postUserId: post?.userId,
    isOwner,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  {post.category?.name || "General"}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                    post.isOpen
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                  {post.isOpen ? "Open" : "Closed"}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {post.title}
              </h1>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Posted by{" "}
              <Link
                href={`/users/${post.userId}`}
                className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                {post.user?.username || "Anonymous"}
              </Link>
            </span>
            {post.location && (
              <span className="flex items-center gap-1">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {post.location}
              </span>
            )}
            <span>
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="mb-6 border-t border-gray-200 pt-6">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {post.description}
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            {isOwner ? (
              <div className="flex gap-3">
                {post.chatRoom && (
                  <button
                    onClick={() => router.push(`/chat/${post.chatRoom.id}`)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                    View Chat
                  </button>
                )}
                {post.isOpen && (
                  <button
                    onClick={handleClose}
                    className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-700">
                    Close Post
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700">
                  Delete Post
                </button>
              </div>
            ) : post.isOpen ? (
              <>
                {userResponse?.responded ? (
                  <button
                    onClick={() =>
                      router.push(`/chat/${userResponse.chatRoomId}`)
                    }
                    className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700">
                    View Chat
                  </button>
                ) : (
                  <button
                    onClick={handleRespond}
                    disabled={responding || checkingResponse}
                    className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
                    {responding ? "Responding..." : "Respond to Post"}
                  </button>
                )}
              </>
            ) : (
              <p className="text-gray-500">This post is closed</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
