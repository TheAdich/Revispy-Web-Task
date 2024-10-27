import React, { useState, ChangeEvent, KeyboardEvent, useEffect, useMemo,useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import Image from 'next/image';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import FileUploadProgress from './progressBar';
import ShareUser from './shareUser';

// Types
interface User {
  username: string;
  email: string;
  id: string;
}

interface Conversation {
  id: string;
  chatName: string;
}

interface Sender {
  email: string;
  id: string;
  username: string;
}

interface Message {
  id: string;
  content: string;
  sender: Sender;
  type: String;
  createdAt?: String;
}

interface CurrentChat {
  chatName: string;
  id: string;
}

const Avatar: React.FC<{ initial: string; className?: string }> = ({ initial, className = '' }) => (
  <div className={`w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium text-gray-600 ${className}`}>
    {initial}
  </div>
);

const ChatInterface = () => {
  const socket = useMemo(() => {
    return io('http://localhost:5000', {
      withCredentials: true,
    });
  }, []);

  const latestMessageRef = useRef<HTMLDivElement | null>(null);

  

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentChat, setCurrentChat] = useState<CurrentChat | undefined>();
  const [newMessage, setNewMessage] = useState<string>('');
  const [userList, setUsersList] = useState<User[]>([]);
  const [conversationList, setConversationList] = useState<Conversation[]>([]);
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [downloadURL, setDownloadURL] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | undefined>();
  const [isUploading, setIsUpLoading] = useState<boolean>(false);
  const [msgToShare, setMsgToShare] = useState<Message>();
  const [shareUserPopup, setShareUserPopup] = useState<boolean>(false);
  const [checkedUsers, setCheckedUsers] = useState<User[]>([]);

  useEffect(() => {
    if (latestMessageRef.current) {
      latestMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messageList]);


  // Initialize auth data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = sessionStorage.getItem('authUser');
      const storedToken = sessionStorage.getItem('jwt');
      if (storedUser) setAuthUser(JSON.parse(storedUser));
      if (storedToken) setToken(storedToken);
    }
  }, []);

  // Socket message handler
  useEffect(() => {
    socket.on('getMessage', (msg: Message) => {
      setMessageList(prev => [...prev, msg]);
      //console.log(msg);
    });

    return () => {
      socket.off('getMessage');
    };
  }, [socket]);

  // Fetch users
  useEffect(() => {
    const getAllUser = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/user/allusers');
        const allUserList = res.data;
        const filteredUsers = allUserList.filter((user: User) => user.id !== authUser?.id);
        setUsersList(filteredUsers);

      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    if (authUser?.id) {
      getAllUser();
    }
  }, [authUser]);

  // Fetch conversations
  useEffect(() => {
    if (token) {
      const fetchAllChats = async () => {
        const instance = axios.create({
          baseURL: 'http://localhost:5000/api/chat',
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": token
          }
        });
        try {

          const res = await instance.get('/fetchallchat');
          console.log(res.data);
          setConversationList(res.data.length > 0 ? res.data : []);

        } catch (err) {
          console.error('Error fetching chats:', err);
        }
      };
      fetchAllChats();
    }
  }, [token]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const handleConversationClick = async (chatId: string) => {
    const instance = axios.create({
      baseURL: 'http://localhost:5000/api/chat',
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": token
      }
    });
    try {
      const res = await instance.post('/getChat', { chatId });
      console.log(res.data, authUser);
      if (res.status === 200) {
        setCurrentChat({ chatName: res.data.chatName, id: res.data.id });
        setMessageList(res.data.messages);
      }
      socket.emit('joinroom', chatId);
    } catch (err) {
      console.error('Error getting chat:', err);
    }
  };

  const handleNewMessageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setNewMessage(e.target.value);
  };

  const sendMessage = async () => {

    if (currentChat?.id) {
      const instance = axios.create({
        baseURL: 'http://localhost:5000/api/msg',
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": token
        }
      });

      //Determining the type of message
      let type = "text";
      const imageRegex = /https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^\/]+\/o\/[^?]+\.(jpg|jpeg|png|gif)\?alt=media&token=[\w-]+/;
      const videoRegex = /https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^\/]+\/o\/[^?]+\.(mp4|mov|avi|mkv|webm)\?alt=media&token=[\w-]+/;
      if (imageRegex.test(newMessage)) {
        type = "image"
      } else if (videoRegex.test(newMessage)) {
        type = "video"
      } else {
        type = "text";
      }



      try {
        const res = await instance.post('/createMsg', {
          chatId: currentChat.id,
          content: newMessage,
          type: type
        });

        if (res.status === 200) {

          const newMsg: Message = {
            content: res.data.content,
            id: res.data.id,
            sender: res.data.sender,
            type: res.data.type,
            createdAt: res.data.createdAt
          };
          setMessageList(prev => [...prev, newMsg]);
          setNewMessage('');
          socket.emit('newMessage', {
            chatId: currentChat.id,
            content: newMsg
          });
        }
      } catch (err) {
        console.error('Error sending message:', err);
      }
    }
  }

  const handleKeyPress = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newMessage.trim() && currentChat?.id) {
      sendMessage();
    }
  };

  const handleCreateChat = async (userId: string) => {
    if (!token) return;

    const instance = axios.create({
      baseURL: 'http://localhost:5000/api/chat',
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": token
      }
    });
    try {
      const res = await instance.post('/createChat', { userId });
      const newConversation = {
        id: res.data.id,
        chatName: (res.data.users[0].username === authUser?.username
          ? res.data.users[1].username
          : res.data.users[0].username),

      };
      //console.log(newConversation);
      setConversationList(prev => [...prev, newConversation]);
    } catch (err) {
      console.error('Error creating chat:', err);
    }
  };
  //Uploading Multimedia
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleShare = (message: Message) => {
    setMsgToShare(message);
    setShareUserPopup((prev) => !prev);
  }

  const handleUpload = () => {
    if (!selectedFile) {
      alert('Please select a file first!');
      return;
    }
    setProgress(0);
    setUploadError(undefined);
    setIsUpLoading(true);
    const storageRef = ref(storage, `uploads/${Date.now()}-${selectedFile.name}`);


    const uploadTask = uploadBytesResumable(storageRef, selectedFile);


    uploadTask.on(
      'state_changed',
      (snapshot) => {

        const progressPercentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progressPercentage);
      },
      (error) => {
        console.error('Upload failed:', error);
        setUploadError(error.message);
        setIsUpLoading(false);
        alert('Error uploading file');
      },
      () => {

        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setNewMessage(url);
          setSelectedFile(null);
          setFileName('');
          setIsUpLoading(false);
          //alert('File uploaded successfully');
        });
      }

    );
  };




  return (
    <>
      <div className="flex h-[90vh] bg-white">
        {/* Left sidebar */}
        <div className="w-80 border-r flex flex-col">


          {/* Conversations */}
          <div className="p-4 h-[50%] mb-8">
            <h2 className="font-bold text-black mb-4">Conversations</h2>
            <div className="space-y-2 h-full overflow-y-auto">
              {conversationList.length > 0 ? (
                conversationList.map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center space-x-4 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                    onClick={() => handleConversationClick(conv.id)}
                  >
                    <Avatar initial={conv.chatName[0].toUpperCase()} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-black">{conv.chatName}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">Select users to Start Conversation</p>
              )}
            </div>
          </div>

          {/* Users */}
          <div className="p-4 pb-10 h-[50%] overflow-y-hidden">
            <h2 className="font-bold text-black mb-4">Users</h2>
            <div className="space-y-2 h-full overflow-y-auto">
              {userList.map((user) => (
                <div
                  key={user.id}
                  className="flex font-bold text-black items-center space-x-4 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                  onClick={() => handleCreateChat(user.id)}
                >
                  <Avatar initial={user.username[0].toUpperCase()} />
                  <span className="font-medium">{user.username}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          {currentChat && (
            <div className='w-[100%] flex items-center border-b'>
              <div className=" p-4 flex items-center space-x-4">
                <Avatar initial={currentChat.chatName[0].toUpperCase()} />
                <span className="font-bold text-black">{currentChat.chatName}</span>
              </div>
              <input className='ml-8 text-gray-400' type="file" onChange={handleFileChange} />
              <img className={`cursor-pointer block w-fit h-fit ${isUploading ? "cursor-not-allowed" : ""}`} src='/uploadFile.png' onClick={handleUpload}></img>
              {(progress > 0 || uploadError) && (
                <FileUploadProgress
                  progress={progress}
                  fileName={fileName}
                  error={uploadError}
                />
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {messageList.length > 0 ? (
              messageList.map((message,index) => (
                <div key={message.id} className="flex w-full flex-col" ref={latestMessageRef}>
                  <div
                    className={`flex w-full ${message.sender?.username === authUser?.username ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`w-[45%] mb-2 p-1 rounded-lg ${message.sender?.username === authUser?.username
                        ? 'bg-[#2F3944] text-white'
                        : 'bg-gray-100 text-black'
                        }`}
                    >
                      {message.type === 'text' ? (
                        <p className="px-2">{message.content}</p>
                      ) : message.type === 'image' ? (
                        <img className="px-2 pt-2 rounded-md" loading="lazy" src={message.content} alt="Uploaded content" />
                      ) : message.type === "video" ? (
                        <video preload="none" className="rounded-md w-full pt-2 px-2" controls src={message.content}></video>
                      ) : (
                        ""
                      )}

                      <p className="p-1 text-[0.8rem] text-right">
                        {message?.createdAt
                          ? new Date(String(message?.createdAt)).toLocaleTimeString("en-US", {
                            timeZone: "Asia/Kolkata",
                            hour12: true,
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                          : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    className={`px-2 py-1 rounded-md ${message.sender?.username === authUser?.username ? "self-end bg-gray-100 text-black" : "self-start bg-[#2F3944] text-white"}`}
                    onClick={() => handleShare(message)}
                  >
                    Share
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No Conversations yet</p>
            )}
          </div>

          {/* Input area */}
          {currentChat && (
            <div className='w-[100%] flex items-center'>
              <div className="border-t p-4 w-[100%] ">
                <input
                  type="text"
                  placeholder="Press Enter to send the msg"
                  value={newMessage}
                  onChange={handleNewMessageChange}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-2 text-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
        <div />
      </div>
      {shareUserPopup && <ShareUser setShareUserPopup={setShareUserPopup} userList={userList} msgToShare={msgToShare} token={token} authUser={authUser} />}
    </>
  );
};

export default ChatInterface;