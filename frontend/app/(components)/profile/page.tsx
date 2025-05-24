'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil } from 'lucide-react';
import { Developer } from '../../../interfaces';
import Footer from '../../footer/Footer';
import SignupPromptModal from '../../signupPromptModal/SignupPromptModal';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/public/store';
import dotenv from "dotenv";
dotenv.config();
export default function ProfilePage() {
  const [developer, setDeveloper] = useState<Developer>({
    id: 'dev123',
    name: 'John Doe',
    YOE: 5,
    email: 'john@example.com',
    phone: '+1234567890',
    password: '********',
    rating: 4.5,
  });

  const router = useRouter();
  const [isEditing, setIsEditing] = useState<keyof Developer | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prevdeveloper,setPrevdeveloper] = useState<Developer>()
  const [refresh, setRefresh] = useState(false);

  const closeModal = () => setIsModalOpen(false);
  const startEditing = (field: keyof Developer) => {
    setIsEditing(field);
    setTempValue(developer[field].toString());
  };
  const token = useSelector((state: RootState)=>state.auth.token)

  useEffect(() => {
    const getData = async () => {
      
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/dev/info`,

          {
            headers: {
              Authorization: token,
            }
          }
        );
        const data = response.data;
        setDeveloper({
          id: developer.id,
          name: data.name,
          YOE: data.YOE,
          email: data.email,
          phone: data.phone,
          password: data.password,
          rating: data.rating
          
        });
        if(prevdeveloper!==developer){
    setPrevdeveloper(developer);
    setRefresh(true);

  }
      } catch (e) {
        console.log(e);
        alert("Something went wrong");
      }
    };

    getData();
  }, [refresh]);
  
  // setRefresh(false);

  const saveEdit = async () => {
    if (isEditing) {
      try {
        const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/dev/edit/${isEditing}`,
          { change: tempValue },
          {    
          headers: {
            'Authorization': token
        }
      }
        );
        if (res.status === 200) {
          setDeveloper(prev => ({
            ...prev,
            [isEditing]: isEditing === 'YOE' ? Number(tempValue) : tempValue,
          }));
        }
      } catch (e) {
        console.error(e);
        alert("Something went wrong");
      }
    }
    setIsEditing(null);
  };

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
            Developer Profile
          </motion.h1>

          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8 max-w-3xl w-full text-left space-y-8">
            {Object.entries(developer).filter(([key]) => key !== 'id').map(([key, value], idx) => (
              <motion.div
                key={key}
                className="flex justify-between items-center border-b border-gray-600 pb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div>
                  <p className="text-sm text-gray-400 capitalize">{key}</p>
                  <p className="text-2xl font-semibold text-white">{value}</p>
                </div>
                {key !== 'rating' && (
                  <button
                    onClick={() => startEditing(key as keyof Developer)}
                    className="p-2 rounded-full hover:bg-gray-700 transition"
                  >
                    <Pencil className="text-blue-400" size={20} />
                  </button>
                )}
              </motion.div>
            ))}
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

        <div className="flex justify-center mt-6">
          <button
            onClick={() => router.push('/dev/addskills')}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-md hover:shadow-xl hover:scale-105 transition"
          >
            Add Skills
          </button>
        </div>
      </main>

      <Footer />

      {isModalOpen && (
        <SignupPromptModal isOpen={isModalOpen} closeModal={closeModal} />
      )}
    </div>
  );
}