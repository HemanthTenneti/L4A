"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function CreatePostPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [location, setLocation] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadCategories();
  }, [user]);

  const loadCategories = async () => {
    try {
      const response = await api.getCategories();
      if (response.success) {
        setCategories(response.data);
        if (response.data.length > 0) {
          setCategoryId(response.data[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Auto-prefix title with "Looking 4 " if not already present
    let finalTitle = title.trim();
    if (!finalTitle.toLowerCase().startsWith("looking 4 ")) {
      finalTitle = `Looking 4 ${finalTitle}`;
    }

    console.log("Submitting post with data:", {
      title: finalTitle,
      description,
      categoryId,
      location,
    });

    try {
      const response = await api.createPost({
        title: finalTitle,
        description,
        categoryId,
        location: location || undefined,
        allowMultipleParticipants: true,
      });

      console.log("Create post response:", response);

      if (response.success) {
        router.push("/");
      } else {
        const errorMessage =
          response.message ||
          (response.errors
            ? JSON.stringify(response.errors, null, 2)
            : "Failed to create post");
        console.error("Post creation error:", errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Create post error:", err);
      setError(err.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Create a New Post
          </h1>
          <p className="mt-2 text-gray-600">
            Share what activity you&apos;re looking for or offering
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Looking for a tennis partner"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                rows={6}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Describe what you're looking for..."
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="City, venue, or area"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
                {loading ? "Creating..." : "Create Post"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
