const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const connectDB = require("./config/dbConnection");
require("dotenv").config();

const adminRouter = require("./routes/adminRoutes/index");
const restaurantRouter = require("./routes/restaurant/index");
const dashboardRouter = require("./routes/restaurant/dashboardroutes");
const userRouter = require("./routes/userRoutes/index");
const browseRouter = require("./routes/public/index");

const { allowAdminOrMaster } = require("./middleware/masterAdminMiddleware");

// ✅ uploadRoutes removed — upload is handled inside restaurantRouter

const app = express();

// ✅ CORS Configuration for Local + Production
const allowedOrigins = [
  // Local development
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  // Production URLs from .env (comma-separated)
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim())
    : []),
].filter(Boolean);

// Debug: Log allowed origins in development
if (process.env.NODE_ENV !== "production") {
  console.log("✅ Allowed CORS Origins:", allowedOrigins);
}

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Log rejected origins for debugging
      console.warn(`❌ CORS Rejected: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-master-admin-secret"],
  }),
);

app.use(
  "/api/restaurant/stripe/webhook",
  express.raw({ type: "application/json" }),
);

app.use(express.json());
connectDB();

app.use("/api/admin", allowAdminOrMaster, adminRouter); //admin routes
app.use("/api/restaurant", restaurantRouter); //restaurant router
app.use("/api/restaurant", dashboardRouter); //restaurant dashboard
app.use("/api/user", userRouter); //user routes
app.use("/api/browse", browseRouter);

app.get("/", (req, res) => res.send("Cayman Backend Running"));

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;
