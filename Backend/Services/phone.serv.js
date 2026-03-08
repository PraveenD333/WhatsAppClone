import dotenv from 'dotenv'
dotenv.config({quiet:true})
import twilio from 'twilio'

// Twillo Credentials From env
const accountSid = process.env.TWILLO_ACCOUNT_SID;
const authToken = process.env.TWILLO_AUTHTOKEN_SID;
const serviceSid = process.env.TWILLO_SERVICE_SID;

const client = twilio(accountSid, authToken);


// Send OTP TO Phone Nimber
export const sendotpToPhone = async (phoneNumber) => {
    try {
        console.log("Sending OTP To This Number", phoneNumber);
        if (!phoneNumber) {
            throw error("Phone Number is required");
        }
        const response = await client.verify.v2.services(serviceSid).verifications.create({
            to: phoneNumber,
            channel: 'sms'
        });
        console.log("This is My OTP", response);
        return response;

    } catch (error) {
        console.error(error);
        throw new Error("Failed to send OTP to phone number");
    }
}

// Verify OTP
export const verifyOtp = async (phoneNumber, otp) => {
    try { 
        const response = await client.verify.v2.services(serviceSid).verificationChecks.create({
            to: phoneNumber,
            code: otp
        });
        console.log("This is My OTP", response);
        return response;

    } catch (error) {
        console.error(error);
        throw new Error("OTP Verification Failed");
    }
}