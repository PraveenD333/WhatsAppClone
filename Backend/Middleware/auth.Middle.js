import jwt from 'jsonwebtoken';
import { errorresponse } from '../Utils/response.js';

const authMiddleware = (req, res, next) => {
    const token = req.cookies.auth_token;
    if (!token) {
        return errorresponse(res, "Unauthorized Token Is Missing", 401);
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        next();
    } catch (error) {
        return errorresponse(res, "Invalid Or Expire Token", 501, error);
    }
}

export default authMiddleware;
