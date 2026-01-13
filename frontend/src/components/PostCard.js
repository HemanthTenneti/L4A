"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostCard({ post }) {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

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
      </div>
    </div>
  );
}
