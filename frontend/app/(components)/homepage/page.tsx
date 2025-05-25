'use client';
import axios from 'axios';
import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, CheckCheck, Mic, Paperclip, Smile, Image as ImageIcon, ThumbsUp, Settings, LogOut, User, Moon, Sun, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import debounce from 'lodash/debounce';

interface Message {
  id: string;
  text?: string;
  image?: string;
  sender: string;
  group: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image';
}

interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Chat {
  chatId: string;
  chatname: string;
  isGroup: boolean;
  username: string;
}

interface SearchUser {
  id: string;
  username: string;
  avatarUrl?: string;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('general');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isCreateChatOpen, setIsCreateChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SearchUser[]>([]);
  const [chatName, setChatName] = useState('');
  const [isGroup, setIsGroup] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Create a memoized debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const response = await axios.get(`http://localhost:3000/api/v1/user/search`, {
          params: { q: query }
        });
        setSearchResults(response.data.users);
      } catch (error) {
        console.error('Error searching users:', error);
        toast.error('Failed to search users');
      } finally {
        setIsSearching(false);
      }
    }, 500),
    [] // Empty dependency array since we don't want to recreate this function
  );

  // Effect to trigger search when query changes
  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/v1/chats/getchats", {
          params: { username: "adminn" }
        });
        setChats(response.data.chats);
      } catch (error) {
        console.error("Error fetching chats:", error);
        toast.error("Failed to fetch chats");
      }
    };

    fetchChats();
  }, []);

  useEffect(() => {
    if (!user) return;

    const newSocket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    newSocket.on('connect', () => {
      newSocket.emit('join', { id: user.id, name: user.username });
    });

    newSocket.on('connect_error', (error) => {
      toast.error('Failed to connect to chat server');
      console.error('Socket connection error:', error);
    });

    newSocket.on('message', (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    newSocket.on('typing', (user: User) => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1000);
    });

    newSocket.on('onlineUsers', (users: User[]) => {
      setOnlineUsers(users);
    });

    setSocket(newSocket);

    return () => {
      newSocket.off('message');
      newSocket.off('typing');
      newSocket.off('onlineUsers');
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!socket || !user || message.trim() === '') return;
    
    const newMsg: Message = {
      id: Date.now().toString(),
      text: message,
      sender: user.username,
      group: selectedGroup,
      timestamp: new Date().toLocaleTimeString(),
      status: 'sent',
      type: 'text'
    };
    
    socket.emit('message', newMsg);
    setMessages((prev) => [...prev, newMsg]);
    setMessage('');
  };

  const handleTyping = () => {
    if (!socket || !user) return;
    socket.emit('typing', { id: user.id, name: user.username });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !socket || !user) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newMsg: Message = {
        id: Date.now().toString(),
        image: reader.result as string,
        sender: user.username,
        group: selectedGroup,
        timestamp: new Date().toLocaleTimeString(),
        status: 'sent',
        type: 'image'
      };
      socket.emit('message', newMsg);
      setMessages((prev) => [...prev, newMsg]);
    };
    reader.readAsDataURL(file);
  };

  const handleReaction = (messageId: string, reaction: string) => {
    if (!socket) return;
    socket.emit('reaction', { messageId, reaction });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/signin';
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    if (isGroup && !chatName.trim()) {
      toast.error('Please enter a chat name');
      return;
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chats/createchat`, {
        usernames: selectedUsers.map(user => user.username),
        isGroup,
        chatname: chatName
      });

      toast.success('Chat created successfully');
      setIsCreateChatOpen(false);
      setSelectedUsers([]);
      setChatName('');
      setIsGroup(false);
      
      // Refresh chats list
      const chatsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/chats/getchats`, {
        params: { username: user?.username }
      });
      setChats(chatsResponse.data.chats);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
    }
  };

  const addUser = (user: SearchUser) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchQuery('');
  };

  const removeUser = (userId: string) => {
    console.log('Removing user with ID:', userId);
    console.log('Current selected users:', selectedUsers);
    const updatedUsers = selectedUsers.filter(user => user.id !== userId);
    console.log('Updated users:', updatedUsers);
    setSelectedUsers(updatedUsers);
  };

  // if (!user) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <p className="text-lg">Please sign in to access the chat</p>
  //     </div>
  //   );
  // }

  return (
    <div className="grid grid-cols-[300px_1fr] h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="border-r border-gray-300 dark:border-gray-700 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chats</h2>
          <Dialog open={isCreateChatOpen} onOpenChange={setIsCreateChatOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Chat</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isGroup"
                    checked={isGroup}
                    onChange={(e) => setIsGroup(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isGroup">Create Group Chat</label>
                </div>
                
                {isGroup && (
                  <Input
                    placeholder="Enter chat name"
                    value={chatName}
                    onChange={(e) => setChatName(e.target.value)}
                  />
                )}

                <div className="space-y-2">
                  <Command className="rounded-lg border shadow-md">
                    <CommandInput 
                      placeholder="Search users..." 
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      {isSearching ? (
                        <div className="p-2 text-sm text-gray-500">Searching...</div>
                      ) : searchResults.length === 0 ? (
                        <CommandEmpty>No users found.</CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {searchResults.map((user) => (
                            <CommandItem
                              key={user.id}
                              onSelect={() => addUser(user)}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={user.avatarUrl} />
                                  <AvatarFallback>{user.username[0]}</AvatarFallback>
                                </Avatar>
                                <span>{user.username}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <Badge 
                      key={user.id} 
                      variant="secondary" 
                      className="flex items-center gap-1 px-2 py-1"
                    >
                      <span>{user.username}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeUser(user.id);
                        }}
                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <Button onClick={handleCreateChat}>Create Chat</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <ul className="space-y-2">
          {chats && chats.length > 0 ? (
            chats.map((chat) => (
              <li
                key={chat.chatId}
                className={`cursor-pointer px-3 py-2 rounded-lg ${selectedGroup === chat.chatId ? 'bg-blue-100 dark:bg-blue-700 text-blue-900 dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}
                onClick={() => setSelectedGroup(chat.chatname)}
              >
                {chat.chatname || 'Unnamed Chat'}
              </li>
            ))
          ) : (
            <li className="text-gray-500">No chats available</li>
          )}
        </ul>
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Online Users</h3>
          <ul>
            {onlineUsers.map((user) => (
              <li key={user.id} className="flex items-center mb-2">
                <Avatar>
                  <AvatarImage src={user.avatarUrl || "/avatar-placeholder.png"} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <span className="ml-2 text-gray-800 dark:text-gray-200">{user.name}</span>
                <span className="ml-auto h-2 w-2 rounded-full bg-green-500"></span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex flex-col h-full">
        <div className="border-b border-gray-300 dark:border-gray-700 p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{selectedGroup}</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline">Search</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                  {theme === 'dark' ? (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4 space-y-3">
          {messages.filter(m => m.group === selectedGroup).map((msg) => (
            <Card key={msg.id} className="w-fit max-w-[70%]">
              <CardContent className="p-3">
                {msg.type === 'text' && <p className="text-sm text-gray-800 dark:text-gray-200">{msg.text}</p>}
                {msg.type === 'image' && (
                  <img src={msg.image} alt="shared" className="max-w-xs rounded-lg" />
                )}
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">{msg.timestamp}</span>
                  <div className="flex items-center gap-1">
                    <ThumbsUp size={16} className="cursor-pointer text-gray-500" onClick={() => handleReaction(msg.id, 'like')} />
                    <CheckCheck size={14} className="text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {isTyping && <p className="text-xs text-gray-500 italic">Someone is typing...</p>}
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="border-t border-gray-300 dark:border-gray-700 p-4 flex items-center gap-2">
          <Smile size={20} className="text-gray-500 cursor-pointer" />
          <label htmlFor="file-upload">
            <Paperclip size={20} className="text-gray-500 cursor-pointer" />
            <input type="file" id="file-upload" hidden onChange={handleImageUpload} accept="image/*" />
          </label>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleTyping}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Mic size={20} className="text-gray-500" />
          <Button onClick={handleSend}>Send</Button>
        </div>
      </div>
    </div>
  );
}
