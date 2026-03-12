import { useState } from 'react'
import useThemeStore from '../../Store/themeStore.js';
import { logOut } from '../../Services/user.service';
import useUserStore from '../../Store/useUserStore.js';
import { toast } from 'react-toastify';
import Layout from '../../Components/Layout';
import { FaComment, FaMoon, FaQuestionCircle, FaSearch, FaSignInAlt, FaSun, FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { disconnectSocket } from '../../Services/chat.service.js';


const Setting = () => {
  const [isThemeDialogOpen, setIsThemeDialogOpen] = useState(false);

  const { theme } = useThemeStore();
  const { user, clearUser } = useUserStore();

  const toggleThemeDialog = () => {
    setIsThemeDialogOpen(!isThemeDialogOpen)
  };

  const handleLogout = async () => {
    try {
      await logOut();
      clearUser();
      disconnectSocket();
      toast.success("Logout Successfully");
    } catch (error) {
      console.error("Failed to Logout", error);
    }
  }
  return (
    <Layout
      isThemeDialogOpen={isThemeDialogOpen}
      toggleThemeDialog={toggleThemeDialog}>

      <div className={`flex h-screen ${theme === "dark" ? " bg-[rgb(17,27,33)] text-white" : "bg-white text-black"}`}>

        <div className={`w-[400px] border-r-2 ${theme === "dark" ? "border-gray-400" : "border-gray-400"}`}>

          <div className='p-4'>
            <h1 className='text-xl font-semibold mb-4'>Settings</h1>

            <div className='relative mb-4'>
              <FaSearch className='absolute left-3 top-3.5 h-4 w-4 text-gray-400' />
              <input type="text" placeholder='Search Settings'
                className={`w-full ${theme === "dark" ? "bg-[#202c33] text-white border-gray-600" : "bg-gray-100 text-black border-gray-400"} border pl-10 placeholder-gray-400 rounded-3xl p-2 `} />
            </div>


            <div className={`flex items-center gap-4 p-3 ${theme === "dark" ? "hover:bg-[#202c33]" : "hover:bg-gray-100"} rounded-lg cursor-pointer mb-4`}>
              <img src={user?.profilePicture} alt="Profile"
                className='w-14 h-14 rounded-full' />
              <div>
                <h2 className='font-semibold'>{user?.username}</h2>
                <p className='text-sm text-gray-400'>{user?.about}</p>
              </div>
            </div>

            {/* Menu Items */}
            <div className='h-[calc(100vh-280px)] overflow-y-auto'>
              <div className='space-y-1'>
                {
                  [{ icon: FaUser, lable: "Account", herf: "/user-profile" },
                  { icon: FaComment, lable: "Chats", herf: "/" },
                  { icon: FaQuestionCircle, lable: "Help", herf: "/help" }
                  ].map((item) => (
                    <Link
                      to={item.herf}
                      key={item.lable}
                      className={`w-full flex items-center gap-3 p-2 rounded
                      ${theme === "dark" ? "text-white hover:bg-[#202c33]" : "text-black hover:bg-gray-200"}`}
                    >
                      <item.icon className='h-5 w-5' />
                      <div className={`border-b ${theme === "dark" ? "border-gray-600" : "border-gray-300"} w-full p-4 `}>
                        {item.lable}
                      </div>
                    </Link>
                  ))}
                {/* Theme Button */}
                <button
                  onClick={toggleThemeDialog}
                  className={`w-full flex items-center gap-3 p-3 rounded cursor-pointer ${theme === "dark" ? "text-white hover:bg-[#202c33]" : "text-black hover:bg-gray-200"}`}>

                  {theme === "dark" ? <FaSun className='h-5 w-5' /> : <FaMoon className='h-5 w-5' />}

                  <div className={`flex text-start border-b ${theme === "dark" ? "border-gray-600" : "border-gray-300"} w-full p-2`}>
                    Theme
                    <span className='ml-auto text-sm text-gray-400'>
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </span>
                  </div>
                </button>
              </div>
              {/* Logout */}
              <button onClick={handleLogout} 
              className={`w-full flex items-center gap-3 p-2 rounded text-red-500 cursor-pointer ${theme === "dark" ? "hover:bg-[#202c33]" : "hover:bg-gray-200"} mt-10 md:mt-20`}>
                <FaSignInAlt className='h-5 w-5'/>
                Logout
              </button>

            </div>
          </div>
        </div>
      </div>

    </Layout>
  )
}

export default Setting
