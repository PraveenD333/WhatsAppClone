import React, { useEffect, useRef, useState } from 'react'
import useThemeStore from '../../Store/themeStore.js';
import useUserStore from '../../Store/useUserStore.js';
import { useChatStore } from '../../Store/chatStore.js';
import { isToday, isYesterday, format } from 'date-fns'
import whatsappLogo from '../../images/whatsapp_image.png'
import { FaArrowLeft, FaEllipsisV, FaFile, FaImage, FaLock, FaPaperclip, FaPaperPlane, FaSmile, FaTimes, FaVideo } from 'react-icons/fa';
import MessageBubble from './MessageBubble';
import EmojiPicker from 'emoji-picker-react';
import VideoCallManager from '../VideoCall/VideoCallManager';
import { getSocket } from '../../Services/chat.service.js';
import useVideoCallStore from '../../Store/videoCallStore.js';
import { toast } from 'react-toastify';


const isValidate = (date) => {
  return date instanceof Date && !isNaN(date);
}

const ChatWindow = ({ selectedContact, setSelectedContact }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showfileMenu, setShowfileMenu] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const typingTimeoutRef = useRef(null);
  const messageEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);

  const { theme } = useThemeStore();
  const { user } = useUserStore();
  const socket = getSocket();

  const {
    messages, sendMessage,
    fetchMessages, fetchConversation, conversation,
    isUserTyping, startTyping, stopTyping, getUserLastSeen, isUserOnline,
    deleteMessage, addreaction, currentConversation } = useChatStore();

  const online = isUserOnline(selectedContact?._id)
  const lastseen = getUserLastSeen(selectedContact?._id)
  const isTyping = isUserTyping(selectedContact?._id)


  useEffect(() => {
    if (selectedContact?._id && conversation?.data?.length > 0) {
      const conver = conversation?.data?.find((conv) => conv.participants?.some((participant) => participant._id === selectedContact._id))
      if (conver?._id) {
        fetchMessages(conver._id)
      }
    }
  }, [selectedContact, conversation])

  useEffect(() => {
    fetchConversation();
  }, []);



  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "auto" })
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages])


  useEffect(() => {
    if (message && selectedContact) {
      startTyping(selectedContact?._id)

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(selectedContact?._id)
      }, 2000)
    }
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [message, selectedContact, startTyping, stopTyping])

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setShowfileMenu(false);
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        setFilePreview(URL.createObjectURL(file))
      }
    }
  }

  const handleSendMessage = async () => {
    if (!selectedContact) return;
    setFilePreview(null);
    try {
      const formData = new FormData();
      formData.append("senderId", user?._id)
      formData.append("receiverId", selectedContact?._id)

      const status = online ? "delivered" : "send";
      formData.append("messageStatus", status);

      if (message.trim()) {
        formData.append("content", message.trim())
      }
      // if there is file include that to
      if (selectedFile) {
        formData.append("media", selectedFile, selectedFile.name)
      }
      if (!message.trim() && !selectedFile) return;
      await sendMessage(formData);

      // clear state
      setMessage("");
      setSelectedFile(null);
      setFilePreview(null);
      setShowfileMenu(false);

    } catch (error) {
      console.error("Failed to send message", error);
    }
  }

  const renderDateSeparator = (date) => {
    if (!isValidate(date)) {
      return null;
    }

    let dateString;
    if (isToday(date)) {
      dateString = "Today";
    } else if (isYesterday(date)) {
      dateString = "Yesterday";
    } else {
      dateString = format(date, "dd/MM/yyyy")
    }

    return (
      <div className='flex justify-center my-4'>
        <span className={`px-4 py-2 rounded-full text-sm ${theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}`}>
          {dateString}
        </span>
      </div>
    )
  }

  //Grouping Messages
  const groupedMessages = Array.isArray(messages) ? messages.reduce((acc, message) => {
    if (!message.createdAt) return acc;
    const date = new Date(message.createdAt);
    if (isValidate(date)) {
      const datestring = format(date, "dd/MM/yyyy");
      if (!acc[datestring]) {
        acc[datestring] = [];
      }
      acc[datestring].push(message);
    } else {
      console.error("Invalid date for message", message)
    }
    return acc;
  }, {}) : {};

  const handleReaction = (messageId, emoji) => {
    addreaction(messageId, emoji)
  }

  const handleVideocall = () => {
    if (selectedContact && online) {
      const { initiateCall } = useVideoCallStore.getState();

      const avatar = selectedContact?.profilePicture

      initiateCall(
        selectedContact?._id,
        selectedContact?.username,
        avatar,
        "video"
      )
    }else{
      toast.error("User is Offline Can't call")
    }
  }


  if (!selectedContact) {
    return (
      <div className='flex-1 flex flex-col items-center justify-center mx-auto h-screen text-center'>
        <div className='max-w-md'>
          <img src={whatsappLogo} alt="chat-App"
            className='w-full h-auto' />
          <h2 className={`text-2xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-black"}`}>
            Select a Conversation to Start Chatting
          </h2>
          <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-6`}>
            Choose a contact from the list on the left to begin messaging
          </p>
          <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-sm  mt-3 gap-2 flex items-center justify-center`}>
            <FaLock className='h-4 w-4' />
            Your Personal messages are end-to-end encrypted.
          </p>
        </div>
      </div>
    )
  }
  return (
    <>
      <div className='flex-1 h-screen w-full flex flex-col'>
        <div className={`p-4 ${theme === "dark" ? "bg-[#1d1e1d] text-white" : "bg-[rgb(239,242,252)] text-gray-600"} flex items-center`}>
          <button className='mr-2 focus:outline-none' onClick={() => setSelectedContact(null)}>
            <FaArrowLeft className='h-6 w-6' />
          </button>

          <img src={selectedContact?.profilePicture} alt={selectedContact?.username}
            className='w-10 h-10 rounded-full' />

          <div className='ml-3 grow'>
            <h2 className='font-semibold text-start'>
              {selectedContact?.username}
            </h2>
            {isTyping ? (
              <div>Typing...</div>) :
              (
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  {online ? "Online" : lastseen ? `Last seen ${format(new Date(lastseen), "HH:mm")}` : "Offline"}
                </p>
              )}
          </div>

          <div className='flex items-center space-x-4'>
            <button className='focus:outline-none' onClick={handleVideocall} title={online ? "Video Call" : "User is Offline"}>
              <FaVideo className='h-5 w-5 text-green-500 hover:text-green-700' />
            </button>
            <button className='focus:outline-none'>
              <FaEllipsisV className='h-5 w-5 text-white' />
            </button>
          </div>
        </div>

              {/* Message Shows in chatWindow */}
        <div className={`flex-1 p-4 overflow-y-auto ${theme === "dark" ? "bg-[#191a1a]" : "bg-[rgb-(241,236,229)]"}`}>
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <React.Fragment key={date}>
              {renderDateSeparator(new Date(date))}
              {msgs.filter(
                (msg) => msg.conversation === currentConversation
              ).map((msg) => (
                <MessageBubble
                  key={msg._id || msg.tempId}
                  message={msg}
                  theme={theme}
                  currentUser={user}
                  onReact={handleReaction}
                  deleteMessage={deleteMessage}
                />
              ))}
            </React.Fragment>
          ))}
          <div ref={messageEndRef} />
        </div>

            {/* File Preview */}
        {filePreview && (
          <div className='relative p-2'>
            {selectedFile.type.startsWith("video/") ? (
              <video
                src={filePreview}
                controls
                playsInline
                preload="metadata"
                className="w-80 object-cover rounded shadow-lg mx-auto"
              />
            ) : (
              <img
                src={filePreview}
                alt='filrPreview'
                className='w-80 object-cover rounded shadow-lg mx-auto' />
            )}

            <button
              onClick={() => {
                setSelectedFile(null)
                setFilePreview(null)
              }}
              className='absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1'>
              <FaTimes className='h-4 w-4' />
            </button>
          </div>
        )}
          
          {/* Show Emoji Picker */}
        <div className={`p-4  ${theme === "dark" ? "bg-[#1d1e1d]" : "bg-white"} flex items-center space-x-2 relative`}>
          <button className='fous:outline-none'
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            <FaSmile
              className={`h-5.5 w-5.5 ${theme === "dark" ? "text-gray-100" : "text-gray-500"}`} />
          </button>

          {showEmojiPicker && (
            <div ref={emojiPickerRef} className='absolute left-0 bottom-16 z-50'>
              <EmojiPicker
                onEmojiClick={(emojiObject) => {
                  setMessage((prev) => prev + emojiObject.emoji)
                  setShowEmojiPicker(false)
                }}
                theme={theme} />
            </div>
          )}
          {/* Show File Menu */}
          <div className='relative'>
            <button
              className='focus:outline-none'
              onClick={() => setShowfileMenu(!showfileMenu)}>
              <FaPaperclip className={`h-5.5 w-5.5 ${theme === "dark" ? "text-gray-100" : "text-gray-500"} mt-2`} />
            </button>
            {showfileMenu && (
              <div className={`absolute bottom-full left-0 mb-2 ${theme === "dark" ? "bg-gray-700" : "bg-white"} rounded-lg shadow-lg`}>
                <input type="file" ref={fileInputRef} onChange={handleFileChange}
                  accept='image/*,video/*'
                  className='hidden' />
                <button onClick={() => fileInputRef.current.click()}
                  className={`flex items-center px-4 py-2 w-full transition-colors ${theme === "dark" ? "hover:bg-gray-500" : "hover:bg-gray-100"}`}>
                  <FaImage className='mr-2' /> Image/video
                </button>

                <button onClick={() => fileInputRef.current.click()}
                  className={`flex items-center px-4 py-2 w-full transition-colors ${theme === "dark" ? "hover:bg-gray-500" : "hover:bg-gray-100"}`}>
                  <FaFile className='mr-2' /> Documents
                </button>
              </div>
            )}
          </div>

          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            placeholder='Type a Message...'
            className={`flex-1 max-w-[55%] px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500
            ${theme === "dark" ? "bg-[#1d1e1d] text-white border-gray-600 placeholder-gray-400" : "bg-white text-black border-gray-400"}`} />

          <button onClick={handleSendMessage} className='focus:outline-none'>
            <FaPaperPlane className='h-6 w-6 text-green-500' />
          </button>
        </div>
      </div>

      <VideoCallManager socket={socket} />
    </>
  )
}

export default ChatWindow