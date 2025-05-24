"use client";
import axios from "axios";
import { useState, useEffect, useRef, FormEvent } from "react";
import { useParams } from "next/navigation";
import type { RootState } from '../../../../../public/store';
import { useSelector } from 'react-redux';
import dotenv from "dotenv";
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import React, { ChangeEvent } from "react";

dotenv.config();

interface Chat {
  id?: string;
  name_of_creator: string;
  message: string;
  room_id: string;
  createdAt?: string | Date;
  creation_time?: string | Date;
}


export default function Chat() {
  const username = useSelector((state: RootState) => state.auth.username);
  const userId = useSelector((state: RootState) => state.auth.userId);
  const roomId = useParams().id as string;
  const wsRef = useRef<WebSocket | null>(null);
  const [readReceipts, setReadReceipts] = useState<{ [messageId: string]: string[] }>({});

  const [chats, setChats] = useState<Chat[]>([]);
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getChats = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/chatroom/${roomId}`);
        setChats(response.data);
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      }
    };
    getChats();
  }, [roomId]);

  useEffect(() => {
    if (!username || !userId || !roomId)
      {console.log("I am Returning");
      return;}

      console.log(username + " " + userId + " " + roomId)
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/api/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to chat server');
      ws.send(JSON.stringify({
        type: "join",
        username,
        userId,
        payload: {
          roomId
        }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "read") {

          setReadReceipts(prev => ({
            ...prev,
            [data.messageId]: [...(prev[data.messageId] || []), data.username]
          }));
          return;
        }

        // Handle new chat messages
        setChats((prevChats) => [...prevChats, data]);
      } catch (error) {
        console.error("Invalid message format:", event.data, error);
      }
    };

    // ws.onerror = () => {
    //   console.error("WebSocket encountered an error (event not detailed).");
    // };

    ws.onclose = () => {
      console.warn("WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, [roomId, userId, username]);
  

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chats]);

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !attachedFile) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    let fileUrl = null;
    if (attachedFile) {
      // 1. Upload file to backend (which uploads to S3)
      const formData = new FormData();
      formData.append("file", attachedFile);

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/upload`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        fileUrl = response.data.url;
      } catch (err) {
        alert("File upload failed");
        return;
      }
    }

    // 2. Send chat message with fileUrl (if any)
    wsRef.current.send(
      JSON.stringify({
        type: "chat",
        userId,
        username,
        payload: { message, fileUrl },
      })
    );

    setChats((prev) => [
      ...prev,
      {
        name_of_creator: username || "Unknown User",
        message,
        room_id: roomId,
        createdAt: new Date(),
        fileUrl,
      },
    ]);
    setMessage("");
    setAttachedFile(null);
  };

  useEffect(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (chats.length === 0) return;

    const lastChat = chats[chats.length - 1];
    // Only send read if the last message is not sent by the current user
    if (lastChat.name_of_creator !== username) {
      wsRef.current.send(JSON.stringify({
        type: "read",
        messageId: lastChat.id, // Make sure your Chat object has an id
        roomId,
        username,
      }));
    }
  }, [chats, username, roomId]);

  return (
    <div className="flex flex-col bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden min-h-0 flex-grow">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 shadow-md border-b border-gray-700 shrink-0">
        <h1 className="text-2xl font-bold text-blue-500">Chat Room: {roomId}</h1>
        <p className="text-sm text-gray-400">Logged in as: {username}</p>
      </div>
  
      {/* Chat messages */}
      <div
        ref={chatContainerRef}
        className=" overflow-y-auto px-40 py-4 space-y-4 flex-grow"
      >
        {chats.map((chat, index) => {
  const isOwnMessage = chat.name_of_creator === username;
  const readers = readReceipts[chat.id ?? ""] || [];
  const hasBeenRead = isOwnMessage && readers.length > 0;

  return (
    <div
      key={chat.id || index}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`w-fit max-w-lg p-3 rounded-xl shadow-md transition-transform ${
        isOwnMessage
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
          : 'bg-gray-700 text-white'
      }`}>
        <div className="text-xs font-medium mb-1 text-gray-300">{chat.name_of_creator}</div>
        <p className="text-base break-words">{chat.message}</p>
        {chat.fileUrl && (
          <div className="mt-2">
            {chat.fileUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
              <img src={chat.fileUrl} alt="attachment" className="max-w-xs max-h-40 rounded" />
            ) : (
              <a href={chat.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                Download file
              </a>
            )}
          </div>
        )}
        <div className="flex items-center justify-end mt-1 gap-1">
          <p className="text-[10px] text-right text-gray-400">
            {new Date(chat.createdAt || chat.creation_time || '').toLocaleTimeString()}
          </p>
          {hasBeenRead && (
            <span title={`Read by: ${readers.join(', ')}`} className="ml-1 text-blue-400 text-xs">
              {/* Blue tick SVG */}
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7.629 15.71a1 1 0 0 1-1.415 0l-3.924-3.924a1 1 0 1 1 1.415-1.415l3.217 3.217 7.217-7.217a1 1 0 1 1 1.415 1.415l-7.925 7.924z"/>
              </svg>
            </span>
          )}
        </div>
      </div>
    </div>
  );
})}
      </div>
  
      {/* Input box */}
      
      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 left-0 w-full bg-gray-900 border-t border-gray-700 px-4 py-3"
      >
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((v) => !v)}
            className="text-2xl"
          >
            😊
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-10 z-50">
              <Picker
                onSelect={(emoji: any) => {
                  setMessage((msg) => msg + emoji.native);
                  setShowEmojiPicker(false);
                }}
                theme="dark"
              />
            </div>
          )}
          <label className="cursor-pointer text-2xl">
            📎
            <input
              type="file"
              onChange={handleFileChange}le={{ display: "none" }}
              className="hidden"andleFileChange}
              accept="image/*,application/pdf"
            />/label>
          </label>
          <inputext"
            type="text"lue={message}
            value={message}=> setMessage(e.target.value)}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."ounded-full bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          /><button
          <buttonype="submit"
            type="submit"      className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold hover:scale-105 transition-all duration-300"
            className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold hover:scale-105 transition-all duration-300">
          >        Send
            Send        </button>
          </button>       </div>












}    );    </div>            </form>        )}          </div>            Attached: {attachedFile.name}          <div className="text-xs text-gray-400 mt-1">        {attachedFile && (        </div>        {attachedFile && (
          <div className="text-xs text-gray-400 mt-1">
            Attached: {attachedFile.name}
          </div>
        )}
      </form>
      
    </div>
  );
  
}