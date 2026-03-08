import crypto from "crypto";

const otpGenerator = () =>{
    return crypto.randomInt(100000, 1000000).toString();
}
// const otpGenerator = () =>{
//     return Math.floor(100000 + Math.random() * 900000);
// }

export default otpGenerator;
