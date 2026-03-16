import jwt from "jsonwebtoken";

// Socket.IO middleware
export const socketAuthMiddleware = (socket, next) => {
  try {
    let token;

    // 1️⃣ Try to get token from handshake auth (frontend can send token in auth)
    if (socket.handshake.auth && socket.handshake.auth.token) {
      token = socket.handshake.auth.token;
    }

    // 2️⃣ If no token, try Authorization header
    if (!token && socket.handshake.headers.authorization) {
      const authHeader = socket.handshake.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    // 3️⃣ If still no token, try cookies (socket.handshake.headers.cookie)
    if (!token && socket.handshake.headers.cookie) {
      const cookies = Object.fromEntries(
        socket.handshake.headers.cookie
          .split("; ")
          .map((c) => c.split("="))
      );
      token = cookies["auth_token"];
    }

    // 4️⃣ If no token at all → reject
    if (!token) {
      return next(new Error("Unauthorized: Token is missing"));
    }

    // 5️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // attach user info to socket object
    next();
  } catch (error) {
    console.error("Socket auth error:", error.message);
    return next(new Error("Invalid or expired token"));
  }
};
