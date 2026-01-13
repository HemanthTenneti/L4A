"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const isActive = path => pathname === path;

  useEffect(() => {
    if (user) {
      loadUnreadNotifications();
      const socket = getSocket();
      if (socket) {
        socket.on("notification:new", () => {
          loadUnreadNotifications();
        });
      }
    }
  }, [user]);

  const loadUnreadNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.getNotifications({
        unreadOnly: "true",
        limit: 1,
      });
      if (response.success) {
        setUnreadCount(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-lg font-bold text-white">L4A</span>
          </div>
          <span className="hidden font-bold text-xl sm:inline-block">
            Looking for Activities
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-blue-600 ${
              isActive("/") ? "text-blue-600" : "text-gray-700"
            }`}>
            Home
          </Link>

          {user ? (
            <>
              <Link
                href="/posts/new"
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive("/posts/new") ? "text-blue-600" : "text-gray-700"
                }`}>
                Look 4
              </Link>
              <Link
                href="/rooms"
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive("/rooms") ? "text-blue-600" : "text-gray-700"
                }`}>
                Your Rooms
              </Link>
              <Link
                href="/profile"
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive("/profile") ? "text-blue-600" : "text-gray-700"
                }`}>
                Profile
              </Link>
              <Link
                href="/notifications"
                className={`relative text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive("/notifications") ? "text-blue-600" : "text-gray-700"
                }`}>
                Notifications
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-4 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-600 text-xs font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700">
                  Hi, {user.username}
                </span>
                <button
                  onClick={logout}
                  className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100">
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
