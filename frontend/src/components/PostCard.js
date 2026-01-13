"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function PostCard({ post, onFavoriteToggle }) {
  const [imageError, setImageError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkFavorite();
      fetchUserRating();
    }
  }, [user, post.id]);

  const checkFavorite = async () => {
    try {
      const response = await api.checkFavorite(post.id);
      if (response.success) {
        setIsFavorited(response.data.isFavorited);
      }
    } catch (error) {
      console.error("Error checking favorite:", error);
    }
  };

  const fetchUserRating = async () => {
    try {
      const response = await api.getUserReviews(post.user?.id);
      if (response.success && response.data.reviews) {
        const myReview = response.data.reviews.find(
          r => r.reviewerId === user.id
        );
        if (myReview) {
          setUserRating(myReview.rating);
        }
      }
    } catch (error) {
      console.error("Error fetching rating:", error);
    }
  };

  const handleToggleFavorite = async e => {
    e.stopPropagation();
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await api.toggleFavorite(post.id);
      if (response.success) {
        setIsFavorited(response.data.isFavorited);
        if (onFavoriteToggle) {
          onFavoriteToggle(post.id, response.data.isFavorited);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!post) {
    return null;
  }

  const formatDate = date => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const categoryName =
    post.category?.name ||
    (typeof post.category === "string" ? post.category : "General");
  const userName = post.user?.username || "Anonymous";

  const handleCardClick = () => {
    router.push(`/posts/${post.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group overflow-hidden rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-300 cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              {categoryName}
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

          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {post.title}
          </h3>

          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {post.description}
          </p>

          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            {post.location && (
              <span className="flex items-center gap-1">
                <svg
                  className="h-4 w-4"
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
            <Link
              href={`/users/${post.user?.id}`}
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              onClick={e => e.stopPropagation()}>
              <svg
                className="h-4 w-4"
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
              {userName}
            </Link>
            <span>•</span>
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleToggleFavorite}
            disabled={loading}
            className={`p-2 rounded-lg transition-colors ${
              isFavorited
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            title={isFavorited ? "Remove from favorites" : "Add to favorites"}>
            <svg
              className="h-5 w-5"
              fill={isFavorited ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
