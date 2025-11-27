import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/index.js";

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// CORS: Allow both local development and deployed frontend
const allowedOrigins = [
  "http://localhost:5173",
  "https://smart-yatri.vercel.app"
];

// Dynamic CORS origin function
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, or SSR)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Optionally, block/allow all or return an error
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api", router);

// 404 handler
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.originalUrl} not found`);
  res.status(404).json({ error: 'Not Found' });
});

export default app;
