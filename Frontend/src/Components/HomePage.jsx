import { useEffect, useState } from 'react'
import Layout from './Layout'
import { motion } from 'framer-motion'
import ChatList from '../Pages/ChatSection/ChatList'
import { getAllUsers } from '../Services/user.service.js'

const HomePage = () => {

  const [allUsers, setAllUsers] = useState([]);

  const getUsers = async () => {
    try {
      const result = await getAllUsers();
      if (result.success === true) {
        setAllUsers(result.data);
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getUsers()
  }, [])

  console.log(allUsers);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className='h-full'>

        <ChatList contacts={allUsers} />

      </motion.div>
    </Layout>
  )
}

export default HomePage