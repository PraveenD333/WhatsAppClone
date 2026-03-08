import { useState } from 'react'
import userLoginStore from '../../Store/useLoginStore.js'
import useUserStore from '../../Store/useUserStore.js';
import useThemeStore from '../../Store/themeStore.js';
import countries from '../../Utils/countriles.js';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaChevronDown, FaPlus, FaUser, FaWhatsapp } from 'react-icons/fa';
import Spinner from '../../Utils/Spinner';
import { sendOtp, updateProfile, verifyOtp } from '../../Services/user.service.js';
import { toast } from 'react-toastify';

// validation Schema
const loginValidationSchema = yup.object().shape({
  phoneNumber: yup.string().nullable().notRequired().length(10, "Phone Number must be 10 Digits").matches(/^\d+$/, "Phone Number be digit").transform((value, originalValue) =>
    originalValue.trim() === "" ? null : value
  ),
  email: yup.string().nullable().notRequired().email("Please enter a valid email").transform((value, originalValue) =>
    originalValue.trim() === "" ? null : value
  )
}).test("at-least-one", "Enter email or phone number is required",
  function (value) {
    return !!(value.phoneNumber || value.email)
  })

const otpValidationSchema = yup.object().shape({
  otp: yup.string().length(6, "otp must be excatly 6 Digits").required("otp is required")
});

const profileValidationSchema = yup.object().shape({
  username: yup.string().required("username is required"),
  agreed: yup.bool().oneOf([true], "You must Agree to the terms")
});

const avatars = [
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Mimi',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Zoe',
]

const Login = () => {
  const { step, setStep, userPhoneData, setUserPhoneData, resetLoginState } = userLoginStore();
  const { setUser } = useUserStore();
  const { theme, setTheme } = useThemeStore();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [profilePicture, setProfilePicture] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showDropDown, setShowDropDown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();




  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors } } = useForm({ resolver: yupResolver(loginValidationSchema) });

  const {
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
    setValue: setOtpValue } = useForm({ resolver: yupResolver(otpValidationSchema) });

  const {
    register: profileRegister,
    handleSubmit: handlePfofileSubmit,
    formState: { errors: profileErrors },
    watch } = useForm({ resolver: yupResolver(profileValidationSchema) });


  const onLoginSubmit = async () => {
    try {
      setLoading(true);
      if (email) {
        const response = await sendOtp(null, null, email);
        if (response.success === true) {
          toast.info("OTP Send to Your Email");
          setUserPhoneData({ email })
          setStep(2);
        }

      } else {
        const response = await sendOtp(phoneNumber, selectedCountry.dialCode, null);
        if (response.success === true) {
          toast.info("OTP Send to Your PhoneNumber");
          setUserPhoneData({ phoneNumber, phoneSufix: selectedCountry.dialCode })
          setStep(2);
        }
      }
    } catch (error) {
      console.log(error);
      setError(error.message || "Failed to Send OTP");
    } finally {
      setLoading(false);
    }
  }
  
  const onOtpSubmit = async () => {
    try {
      setLoading(true);
      if (!userPhoneData) {
        throw new error("Phone or Email data is missing")
      }
      const otpString = otp.join("");
      let response;
      if (userPhoneData?.email) {
        response = await verifyOtp(null, null, otpString, userPhoneData.email);
      } else {
        response = await verifyOtp(userPhoneData.phoneNumber, userPhoneData.phoneSufix, otpString);
      }
      if (response.success === true) {
        toast.success("OTP Verified Successfully");
        const user = response.data?.user;
        console.log("OTP Response User:", response.data?.user);

        if (user?.username && user?.profilePicture) {
          setUser(user)
          toast.success("Welcome Back to WhatsApp");
          navigate("/")
          resetLoginState()
        } else {
          setStep(3);
        }
      }
    } catch (error) {
      console.log(error);
      setError(error.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  }

  const onProfileSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("username", data.username)
      formData.append("agreed", data.agreed)
      if (profilePictureFile) {
        formData.append("media", profilePictureFile);
      } else {
        formData.append("profilePicture", selectedAvatar);
      }
      await updateProfile(formData);
      toast.success("Welcome back to WhatsApp");
      navigate("/")
      resetLoginState();
    } catch (error) {
      console.log(error);
      setError(error.message || "Failed to Update user Profile");
    } finally {
      setLoading(false);
    }
  }

  const handleOtpChange = (index, value) => {
    const newotp = [...otp];
    newotp[index] = value;
    setOtp(newotp);
    setOtpValue("otp", newotp.join(""));
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  }

  const handleback = () => {
    setStep(1);
    setUserPhoneData(null);
    setOtp(["", "", "", "", "", ""]);
    setError("");
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      setProfilePicture(URL.createObjectURL(file));
    }
  }


  const filterCountries = countries.filter(
    (country) => country.name.toLowerCase().includes(searchTerm.toLowerCase()) || country.dialCode.includes(searchTerm))


  const ProgressBar = () => (
    <div className={`w-full ${theme === 'dark' ? "bg-gray-700" : "bg-gray-200"} rounded-full h-2.5 mb-6`}>
      <div className='bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-in-out'
        style={{ width: `${(step / 3) * 100}%` }}>
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen ${theme === 'dark' ? "bg-gray-900" : "bg-gradient-to-br from-green-400 to-blue-500"} 
    flex items-center justify-center p-4 overflow-hidden`}>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`${theme === 'dark' ? "bg-gray-800 text-white" : "bg-white text-black"} p-6 md:p-8 rounded-lg shadow-2xl w-full max-w-md relative z-10`}>

        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 50, damping: 20 }}
          className='w-24 h-24 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center'>
          <FaWhatsapp className='w-16 h-16 text-white' />
        </motion.div>
        <h1 className={`text-3xl font-bold text-center mb-6 ${theme === 'dark' ? "text-white" : "text-gray-800"}`}>
          WhatsApp Login
        </h1>
        <ProgressBar />
        {/* Error */}
        {error && <p className='text-red-500 text-center mb-4'>{error}</p>}

        {step === 1 && (
          <form className='space-y-4' onSubmit={handleLoginSubmit(onLoginSubmit)}>
            <p className={`text-center ${theme === 'dark' ? "text-gray-300" : "text-gray-600"} mb-4`}>
              Enter your phone Number to Receive an OTP
            </p>


            {/* PhoneNumber and Select CountryCode */}
            <div className='relative'>
              <div className='flex'>
                <div className='relative w-1/3'>
                  {/* Select Button Flag And Country Code */}
                  <button
                    type='button'
                    className={`shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center 
                    ${theme === 'dark' ? "text-white bg-gray-700 border-gray-600" : "text-gray-900 bg-gray-100 border-gray-300"}
                    border roundede-s-lg hover:bg-gray-200 focus:right-4 focus:outline-none focus:ring-gray-100`}
                    onClick={() => setShowDropDown(!showDropDown)}>
                    <span>
                      {selectedCountry.flag} {selectedCountry.dialCode}
                    </span>
                    <FaChevronDown className='ml-2' />
                  </button>
                  {/* Select a Country */}
                  {showDropDown && (
                    <div className={`absolute z-10 w-full mt-1 
                      ${theme === 'dark' ? "bg-gray-700 border-gray-700" : "bg-white border-gray-300"}
                      border rounded-md shadow-lg max-h-60 overflow-auto`}>

                      <div className={`sticky top-0 ${theme === 'dark' ? "bg-gray-700" : "bg-white"}p-2`}>
                        <input
                          type="text"
                          placeholder='Search countries....'
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className={`w-full px-2 py-1 border 
                            ${theme === 'dark' ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300"}
                            rounded-md text-sm focus:outline-none focus:right-2 focus:ring-green-500`} />
                      </div>
                      {filterCountries.map((country) => (
                        <button
                          key={country.alpha2}
                          type='button'
                          className={`w-full text-left px-3 py-2 ${theme === 'dark' ? "hover:bg-gray-600" : "bg-gray-100"}
                          focus:outline-none focus:bg-gray-100`}
                          onClick={() => {
                            setSelectedCountry(country)
                            setShowDropDown(false)
                          }}>
                          {country.flag} ({country.dialCode}) {country.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <input type="text"
                  {...loginRegister("phoneNumber")}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder='Phone Number'
                  className={`w-2/3 px-4 py-2 border 
                        ${theme === 'dark' ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}
                        rounded-md text-sm focus:outline-none focus:right-2 focus:ring-green-500 
                        ${loginErrors.phoneNumber ? "border-red-500" : ""}`} />
              </div>
              {loginErrors.phoneNumber && (
                <p className='text-red-500 text-sm'>{loginErrors.phoneNumber.message}</p>
              )}
            </div>

            {/* Devider With OR */}
            <div className='flex items-center my-4'>
              <div className='flex grow h-px bg-gray-400' />
              <span className='mx-3 text-gray-500 text-sm font-medium'>o r</span>
              <div className='flex grow h-px bg-gray-400' />
            </div>

            {/* Email Input-Box */}
            <div className={`flex items-center border rounded-md px-3 py-2 
                ${theme === 'dark' ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}>
              <FaUser className={`mr-2 text-gray-400 ${theme === 'dark' ? "text-gray-400" : "text-gray-500"}`} />

              <input type="email"
                {...loginRegister("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Email (Optional)'
                className={`w-full bg-transparent focus:outline-none 
                        ${theme === 'dark' ? "text-white" : "bg-black"}
                        ${loginErrors.email ? "border-red-500" : ""}`} />

              {loginErrors.email && (
                <p className='text-red-500 text-sm'>{loginErrors.email.message}</p>
              )}
            </div>
            <button
              type='submit'
              className='w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition'>
              {loading ? <Spinner /> : "Send OTP"}
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleOtpSubmit(onOtpSubmit)} className='space-y-4'>
            <p className={`text-center ${theme === 'dark' ? "text-gray-300" : "text-gray-600"} mb-4`}>
              Please Enter the 6-digit OTP send to Your {userPhoneData ? userPhoneData.phoneSufix : "Email"} {" "}
              {userPhoneData?.phoneNumber && userPhoneData.phoneNumber}
            </p>

            <div className='flex justify-between'>
              {otp.map((digit, index) => (
                <input type="text" key={index}
                  id={`otp-${index}`}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className={`w-12 h-12 text-center border ${theme === 'dark' ? "bg-gray-600 text-white" : "bg-white border-gray-300"} 
                  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${otpErrors.otp ? "border-red-500" : ""}`} />
              ))}
            </div>
            {otpErrors.otp && (
              <p className='text-red-500 text-sm'>{otpErrors.otp.message}</p>
            )}

            <button type='submit'
              className='w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition'>
              {loading ? <Spinner /> : "Verify OTP"}
            </button>

            <button
              type='button'
              onClick={handleback}
              className={`w-full mt-2 ${theme === 'dark' ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"}py-2 rounded-md hover:bg-gray-300 transition flex items-center justify-center`}>
              <FaArrowLeft className='mr-2' />
              Wrong Number ? Go Back
            </button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handlePfofileSubmit(onProfileSubmit)} className='space-y-4'>
            <div className='flex flex-col items-center mb-4'>
              <div className='relative w-24 h-24 mb-2'>
                <img src={profilePicture ? profilePicture : selectedAvatar} alt="Profile"
                  className='w-full h-full rounded-full object-cover' />
                <label htmlFor='ProfilePicture'
                  className='absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full cursor-pointer hover:bg-green-600 transition duration-300'>
                  <FaPlus className='w-4 h-4' />
                </label>
                <input type="file" id="ProfilePicture" accept='image/*'
                  onChange={handleFileChange}
                  className='hidden' />
              </div>
              <p className={`text-sm ${theme === 'dark' ? "text-gray-300" : "text-gray-500"}mb-2`}>
                Choose An Avatar
              </p>

              <div className='flex flex-wrap justify-center gap-3 mt-5'>
                {avatars.map((avatar, index) => (
                  <img key={index} src={avatar} alt={`Avatar ${index + 1}`}
                    className={`w-12 h-12 rounded-full cursor-pointer transition duration-300 ease-in-out transform hover:scale-110
                   ${selectedAvatar === avatar ? "ring-2 ring-green-500" : ""}`}
                    onClick={() => setSelectedAvatar(avatar)} />
                ))}
              </div>
            </div>
            <div className='relative'>
              <FaUser
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? "text-gray-400" : "text-gray-400"}`} />
              <input
                type="text"
                {...profileRegister("username")}
                placeholder='UserName'
                className={`w-full pl-10 pr-3 py-2
                ${theme === 'dark' ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} 
                rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-lg`} />
              {profileErrors.username && (
                <p className='text-red-500 text-sm'>
                  {profileErrors.username.message}
                </p>
              )}
            </div>
            <div className='flex items-center space-x-2'>
              <input
                type="checkbox"
                {...profileRegister("agreed")}
                className={`rounded ${theme === 'dark' ? "text-green-500 bg-gray-700" : "text-green-500"} focus:ring-green-500`} />
              <label
                htmlFor="terms"
                className={`text-sm ${theme === 'dark' ? "text-gray-300" : "text-gray-700"}`}>
                I agree to the {" "}
                <a href="#" className='text-red-500 hover:underline'>
                  Terms and Conditions
                </a>
              </label>
            </div>
            {profileErrors.agreed && (
              <p className='text-red-500 text-sm mt-1'>
                {profileErrors.agreed.message}
              </p>
            )}

            <button type='submit'
              disabled={!watch("agreed") || loading}
              className={`w-full bg-green-500 text-white font-bold py-3 px-4  rounded-md transition duration-300 ease-in-out transform hover:scale-105 
                flex items-center justify-center text-lg
                ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
              {loading ? <Spinner /> : "Create Profile"}
            </button>
          </form>
        )}
      </motion.div>

    </div>
  )
}

export default Login