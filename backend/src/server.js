import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

dotenv.config();


const __dirname = path.resolve();
// const app = express(); 




// app.use(express.json());
// app.use(express.urlencoded({ extended: true}));
// 



// const app = express();

const allowedOrigins = [
  ENV.CLIENT_URL,
  "https://chatlychatapp.vercel.app",
  "http://localhost:5173",
  "http://localhost:8080",
].filter(Boolean);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());

const PORT=process.env.PORT || 3000;

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);


// if (ENV.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname,"../frontend/dist")));
// }
// app.get("*", (_, res) => {
//    res.sendFile(path.join(__dirname,"../frontend/dist/index.html"));
// });


import fs from "fs";

const frontendDistPath = path.join(__dirname, "../frontend/Chatly/dist");
const legacyDistPath = path.join(__dirname, "../frontend/dist");

if (ENV.NODE_ENV === "production") {
  if (fs.existsSync(path.join(frontendDistPath, "index.html"))) {
    app.use(express.static(frontendDistPath));
    app.get("*", (_, res) => {
      res.sendFile(path.join(frontendDistPath, "index.html"));
    });
  } else if (fs.existsSync(path.join(legacyDistPath, "index.html"))) {
    app.use(express.static(legacyDistPath));
    app.get("*", (_, res) => {
      res.sendFile(path.join(legacyDistPath, "index.html"));
    });
  } else {
    app.get("/", (_, res) => {
      res.status(200).json({ message: "Chatly Backend API is running" });
    });
  }
} else {
  app.get("/", (_, res) => {
    res.status(200).json({ message: "Chatly Backend API is running" });
  });
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
