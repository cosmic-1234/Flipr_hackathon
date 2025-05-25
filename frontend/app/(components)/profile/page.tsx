'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/public/store';
import dotenv from "dotenv"
dotenv.config()

interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string | null;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState<keyof User | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [refresh, setRefresh] = useState(false);

  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/user/profile`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        setUser(response.data);
      } catch (e) {
        console.log(e);
        alert('Something went wrong');
      }
    };
    getData();
  }, [refresh, token]);

  const startEditing = (field: keyof User) => {
    setIsEditing(field);
    setTempValue(user ? (user[field] ?? '').toString() : '');
  };

  const saveEdit = async () => {
    if (isEditing && user) {
      try {
        const res = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/user/edit/${isEditing}`,
          { change: tempValue },
          {
            headers: {
              Authorization: token,
            },
          }
        );
        if (res.status === 200) {
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  [isEditing]: tempValue,
                }
              : prev
          );
        }
      } catch (e) {
        console.error(e);
        alert('Something went wrong');
      }
    }
    setIsEditing(null);
    setRefresh((r) => !r);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white min-h-screen flex flex-col">
      <main className="flex-grow">
        <section className="relative flex flex-col items-center justify-center text-center py-24 px-6">
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-500 to-cyan-400 text-transparent bg-clip-text mb-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            User Profile
          </motion.h1>

          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8 max-w-3xl w-full text-left space-y-8">
            {/* Avatar */}
            <div className="flex justify-center mb-6">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-cyan-400"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center text-3xl font-bold text-cyan-200">
                  {user.username[0]?.toUpperCase()}
                </div>
              )}
            </div>
            {/* User Info */}
            {(['username', 'email', 'isOnline', 'createdAt', 'updatedAt'] as (keyof User)[]).map(
              (key, idx) => (
                <motion.div
                  key={key}
                  className="flex justify-between items-center border-b border-gray-600 pb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div>
                    <p className="text-sm text-gray-400 capitalize">{key}</p>
                    <p className="text-2xl font-semibold text-white">
                      {key === 'isOnline'
                        ? user.isOnline
                          ? 'Online'
                          : 'Offline'
                        : key === 'createdAt' || key === 'updatedAt'
                        ? new Date(user[key]).toLocaleString()
                        : user[key]}
                    </p>
                  </div>
                  {['username', 'email', 'avatarUrl'].includes(key) && (
                    <button
                      onClick={() => startEditing(key)}
                      className="p-2 rounded-full hover:bg-gray-700 transition"
                    >
                      <Pencil className="text-blue-400" size={20} />
                    </button>
                  )}
                </motion.div>
              )
            )}
          </div>

          {/* Edit Modal */}
          {isEditing && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-900 rounded-xl p-8 w-96 border border-gray-700 shadow-xl">
                <h2 className="text-xl font-bold text-blue-400 mb-4">Edit {isEditing}</h2>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                />
                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    onClick={() => setIsEditing(null)}
                    className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:scale-105 transition"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}