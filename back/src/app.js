import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Allow credentials and dynamic origin for CORS
// eslint-disable-next-line no-undef
const allowedOrigins = [
  "http://localhost:5173",
  "https://smart-yatri.vercel.app",
  // Add more frontend origins as needed
  // eslint-disable-next-line no-undef
  process.env.FRONTEND_URL, // Allow frontend URL from environment variable
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, etc)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // In production, be more permissive for Render/Vercel deployments
      // Allow any HTTPS origin that matches common patterns
      // eslint-disable-next-line no-undef
      if (process.env.NODE_ENV === 'production') {
        // Allow vercel.app, netlify.app, render.com, etc.
        const allowedPatterns = [
          /^https:\/\/.*\.vercel\.app$/,
          /^https:\/\/.*\.netlify\.app$/,
          /^https:\/\/.*\.onrender\.com$/,
        ];
        if (allowedPatterns.some(pattern => pattern.test(origin))) {
          return callback(null, true);
        }
      }
      console.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use("/api", router);

// 404 handler
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.originalUrl} not found`);
  res.status(404).json({ error: 'Not Found' });
});

export default app;
