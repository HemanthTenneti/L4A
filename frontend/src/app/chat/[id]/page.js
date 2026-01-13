"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  initializeSocket,
  joinChatRoom,
  leaveChatRoom,
  onNewMessage,
  offNewMessage,
  getSocket,
  emitTyping,
  onTyping,
  offTyping,
} from "@/lib/socket";

export default function ChatPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const [chatRoom, setChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [typing, setTyping] = useState({});
  const [leavingRoom, setLeavingRoom] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Initialize Socket.IO with the current token
    const token = localStorage.getItem("accessToken");
    if (token) {
      console.log("Initializing socket with token");
      initializeSocket(token);
    }

    loadChatRoom();
  }, [params.id, user]);

  useEffect(() => {
    // Join chat room when it loads
    if (chatRoom?.id) {
      console.log("Chat room loaded, joining socket room:", chatRoom.id);

      // Wait a tick to ensure socket is connected
      const timer = setTimeout(() => {
        joinChatRoom(chatRoom.id);
      }, 100);

      // Subscribe to new messages
      const handleNewMessage = data => {
        console.log("New message received via socket:", data);
        const newMessage = data.data || data;

        setMessages(prev => {
          // Check if message already exists by ID
          const messageExists = prev.some(msg => msg.id === newMessage.id);
          if (messageExists) {
            console.log(
              "Message already exists, skipping duplicate:",
              newMessage.id
            );
            return prev;
          }
          console.log("Adding new message from socket:", newMessage.id);
          return [...prev, newMessage];
        });
      };

      onNewMessage(handleNewMessage);

      // Subscribe to typing events
      onTyping(handleTyping);

      return () => {
        clearTimeout(timer);
        console.log("Leaving chat room:", chatRoom.id);
        leaveChatRoom(chatRoom.id);
        offNewMessage(handleNewMessage);
        offTyping(handleTyping);
      };
    }
  }, [chatRoom?.id]);

  const handleTyping = data => {
    const { typingUserIds } = data;

    // Create mapping of user IDs to usernames
    const typingMap = {};
    typingUserIds.forEach(userId => {
      if (userId !== user.id) {
        // Find the username from participants
        const participant = chatRoom?.participants?.find(
          p => p.userId === userId
        );
        if (participant?.user?.username) {
          typingMap[userId] = participant.user.username;
        }
      }
    });
    setTyping(typingMap);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatRoom = async () => {
    try {
      const response = await api.getChatRoom(params.id);
      console.log("Chat room response:", response);
      if (response.success) {
        setChatRoom(response.data);
        await loadMessages();
      } else {
        console.error("Failed to load chat:", response.message);
      }
    } catch (error) {
      console.error("Failed to load chat room:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await api.getChatMessages(params.id, { limit: 50 });
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const handleSendMessage = async e => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      setSending(true);
      // Emit typing stop
      emitTyping(params.id, false);
      const response = await api.sendMessage(params.id, messageText);
      if (response.success) {
        // Optimistic update: add message immediately for the sender
        // The socket broadcast will ensure all other users receive it
        setMessages([...messages, response.data]);
        setMessageText("");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = e => {
    const newText = e.target.value;
    setMessageText(newText);

    // Emit typing event
    emitTyping(params.id, newText.length > 0);

    // Clear the previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set a new timeout to emit typing stop after 2 seconds of inactivity
    if (newText.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        emitTyping(params.id, false);
      }, 2000);
    }
  };

  const handleLeaveRoom = async () => {
    if (!confirm("Are you sure you want to leave this chat room?")) {
      return;
    }

    try {
      setLeavingRoom(true);
      const response = await api.leaveRoom(params.id);
      if (response.success) {
        router.push("/rooms");
      } else {
        alert("Failed to leave room");
      }
    } catch (error) {
      console.error("Failed to leave room:", error);
      alert("Failed to leave room");
    } finally {
      setLeavingRoom(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!chatRoom) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Chat not found</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {chatRoom.post?.title || "Chat"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {chatRoom.participants?.length || 0} participant
              {chatRoom.participants?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLeaveRoom}
              disabled={leavingRoom}
              className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-colors disabled:opacity-50">
              {leavingRoom ? "Leaving..." : "Leave"}
            </button>
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700 transition-colors">
              ✕
            </Link>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="container mx-auto max-w-2xl space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.senderId === user.id ? "justify-end" : "justify-start"
                }`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.senderId === user.id
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-900 border border-gray-200"
                  }`}>
                  {msg.senderId !== user.id && (
                    <p className="text-xs font-semibold mb-1 opacity-75">
                      {msg.sender?.username || "Unknown"}
                    </p>
                  )}
                  <p className="text-sm break-all">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.senderId === user.id
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}>
                    {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          {Object.keys(typing).length > 0 && (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="flex gap-1">
                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span
                  className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}></span>
                <span
                  className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}></span>
              </div>
              <span className="text-sm">
                {Object.values(typing).join(", ")}{" "}
                {Object.keys(typing).length === 1 ? "is" : "are"} typing...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="container mx-auto max-w-2xl">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={messageText}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !messageText.trim()}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
