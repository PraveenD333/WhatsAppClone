import { useState } from 'react';
import useLayoutStore from '../../Store/layoutStore.js';
import useThemeStore from '../../Store/themeStore.js';
import useUserStore from '../../Store/useUserStore.js';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';
import formatTimestamp from '../../Utils/formateTime.js';

const ChatList = ({ contacts }) => {
  const setSelectedContact = useLayoutStore((state) => state.setSelectedContact);
  const selectedContact = useLayoutStore((state) => state.selectedContact);
  const { theme } = useThemeStore();
  const { user } = useUserStore();
  const [searchTerms, setSearchTerm] = useState("");

  const filteredContacts = contacts?.filter((contact) =>
    contact?.username?.toLowerCase().includes(searchTerms.toLowerCase()));


  return (
    <div className={`w-full border-r-2 h-screen ${theme === "dark" ? "bg-[rgb(17,27,33)] border-gray-400" : " bg-white border-gray-400"}`}>
      <div className={`p-4 flex justify-between ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
        <h2 className='text-xl font-semibold'>
          Chats
        </h2>
        <button className='p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors'>
          <FaPlus />
        </button>
      </div>
      <div className='p-2'>
        <div className='relative'>
          <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2
            ${theme === "dark" ? "text-gray-400" : "text-gray-400"}`} />

          <input
            type="text" placeholder='Search or Start new Chat'
            className={`w-full pl-10 pr-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-500
            ${theme === "dark" ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400" : "bg-gray-100 text-black border-gray-400 placeholder-gray-400"}`}
            value={searchTerms}
            onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className='overflow-y-auto h-[calc(100vh-120px)]'>
        {filteredContacts.map((contact) => (
          <motion.div
            key={contact?._id}
            onClick={() => setSelectedContact(contact)}
            className={`p-3 flex items-center cursor-pointer transition-colors rounded
             ${selectedContact?._id === contact._id ? theme === "dark" ? "bg-gray-700" : "bg-[#25d365cf]" : theme === "dark" ? "hover:bg-gray-800" : "hover:bg-[#25d36552]"}`}

          >
            <img src={contact?.profilePicture}
              alt={contact?.username}
              className='w-12 h-12 rounded-full' />

            <div className='ml-3 flex-1'>
              <div className='flex justify-between items-baseline'>
                <h2 className={`font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>
                  {contact?.username}
                </h2>
                {contact?.Conversation && (
                  <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}}`}>
                    {formatTimestamp(contact?.Conversation?.lastMessage?.createdAt)}
                  </span>
                )}
              </div>
              <div className='flex justify-between items-baseline'>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"} truncate`}>
                  {contact?.Conversation?.lastMessage?.content}
                </p>
                {contact?.Conversation && contact?.Conversation?.unreadCount > 0 && contact?.Conversation?.lastMessage?.receiver === user?._id && (
                  <p className={`text-sm font-semibold w-6 h-6 flex items-center justify-center bg-yellow-500 ${theme === "dark" ? "text-gray-800" : "text-gray-500"} rounded-full`}>
                    {contact?.Conversation?.unreadCount}
                  </p>
                )}
              </div>
            </div>

          </motion.div>
        ))}

      </div>
    </div>
  )
}

export default ChatList