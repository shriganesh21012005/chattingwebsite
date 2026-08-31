import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    // extract token from http-only cookies
    const token = socket.handshake.headers.cookie
      ?.split("; ")
      .find((row) => row.startsWith("jwt="))
      ?.split("=")[1];

    let user;

    if (token) {
      try {
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if (decoded) {
          user = await User.findById(decoded.userId).select("-password");
        }
      } catch (err) {
        console.log("Token verification failed in socket auth, trying fallback...");
      }
    }

    // Fallback: check query or auth object for userId (useful when cookies are blocked cross-domain)
    const userId = socket.handshake.query?.userId || socket.handshake.auth?.userId;
    if (!user && userId) {
      user = await User.findById(userId).select("-password");
    }

    if (!user) {
      console.log("Socket connection rejected: No valid user or token provided");
      return next(new Error("Unauthorized - Authentication failed"));
    }

    // attach user info to socket
    socket.user = user;
    socket.userId = user._id.toString();

    console.log(`Socket authenticated for user: ${user.fullName} (${user._id})`);
    next();
  } catch (error) {
    console.log("Error in socket authentication:", error.message);
    next(new Error("Unauthorized - Authentication failed"));
  }
};
