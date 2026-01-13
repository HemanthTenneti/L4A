"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export default function MyRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leavingRoomId, setLeavingRoomId] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadRooms();
  }, [user]);

  const loadRooms = async () => {
    try {
      const response = await api.getUserRooms({ limit: 50 });
      if (response.success) {
        setRooms(response.data);
      }
    } catch (error) {
      console.error("Failed to load rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = async (e, roomId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to leave this chat room?")) {
      return;
    }

    try {
      setLeavingRoomId(roomId);
      const response = await api.leaveRoom(roomId);
      if (response.success) {
        setRooms(rooms.filter(room => room.id !== roomId));
      } else {
        alert("Failed to leave room");
      }
    } catch (error) {
      console.error("Failed to leave room:", error);
      alert("Failed to leave room");
    } finally {
      setLeavingRoomId(null);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Your Chat Rooms
        </h1>

        {rooms.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500 text-lg mb-4">No chat rooms yet</p>
            <p className="text-gray-400 mb-6">
              Respond to posts to start chatting with people
            </p>
            <Link
              href="/"
              className="inline-block rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700">
              Browse Posts
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.map(room => (
              <div
                key={room.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                <Link
                  href={`/chat/${room.id}`}
                  className="block hover:no-underline">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg truncate">
                        {room.post.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Posted by{" "}
                        <span className="font-medium text-gray-700">
                          {room.post.user.username}
                        </span>
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 ml-4 shrink-0">
                      {room.participants.length} member
                      {room.participants.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {room.messages && room.messages.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">
                          {room.messages[0].sender.username}
                        </span>
                        : {room.messages[0].content.substring(0, 60)}
                        {room.messages[0].content.length > 60 ? "..." : ""}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(
                          room.messages[0].createdAt
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  )}
                </Link>
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={e => handleLeaveRoom(e, room.id)}
                    disabled={leavingRoomId === room.id}
                    className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-50">
                    {leavingRoomId === room.id ? "Leaving..." : "Leave Room"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
