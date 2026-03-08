import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom'
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ProtectedRoute, PublicRoute } from './Protected';
import Login from './Pages/User-Login/Login.jsx';
import HomePage from './Components/HomePage.jsx';
import UserDetails from './Components/UserDetails.jsx';
import Status from './Pages/StatusSection/Status.jsx';
import Setting from './Pages/SettingSection/Setting.jsx';
import useUserStore from './Store/useUserStore.js';
import { disconnectSocket, initializeSocket } from './Services/chat.service.js';
import { useChatStore } from './Store/chatStore.js';
import Help from './Pages/Help.jsx';



const App = () => {
  const {user} = useUserStore();
  const {setCurrentUser,initsocketListners,cleanup} = useChatStore();

  useEffect(() =>{
    if(user?._id){
      const socket = initializeSocket();

    if(socket){
      setCurrentUser(user);
      initsocketListners();
    }
  }
    return () => {
      cleanup();
      disconnectSocket();
    }
  },[user,setCurrentUser,initsocketListners,cleanup])

  return (
    <>
      <ToastContainer position='top-right' autoClose={3000} />

      <Routes>

        <Route element={<PublicRoute/>}>
        <Route path='/user-login' element={<Login/>} />
        </Route>

        <Route element={<ProtectedRoute/>}>
          <Route path='/' element={<HomePage/>}/>
          <Route path='/user-profile' element={<UserDetails/>}/>
          <Route path='/status' element={<Status/>}/>
          <Route path='/setting' element={<Setting/>}/>
          <Route path='/help' element={<Help/>}/>
        </Route>

      </Routes>
    </>

  )
}

export default App