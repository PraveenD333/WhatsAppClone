import axiosInstance from "./url.service"

export const sendOtp = async (phoneNumber, phoneSufix, email) => {
    try {
        const response = await axiosInstance.post('/auth/send-otp', { phoneNumber, phoneSufix, email });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}

export const verifyOtp = async (phoneNumber, phoneSufix, otp, email) => {
    try {
        const response = await axiosInstance.post('/auth/verify-otp', { phoneNumber, phoneSufix, otp, email });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}

export const updateProfile = async (updateData) => {
    try {
        const response = await axiosInstance.put('/auth/update-profile', updateData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}

export const checkAuth = async () => {
    try {
        const response = await axiosInstance.get('/auth/check-auth');
        if (response.data.success === true) {
            return { isAuthenticated: true, user: response?.data?.data }
        } else if (response.data.success === false) {
            return { isAuthenticated: false }
        }
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}

export const getAllUsers = async () => {
    try {
        const response = await axiosInstance.get('/auth/user');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}

export const logOut = async () => {
    try {
        const response = await axiosInstance.get('/auth/logout');
        localStorage.removeItem("auth_token");
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}
