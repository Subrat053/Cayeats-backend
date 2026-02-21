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

// ✅ uploadRoutes removed — upload is handled inside restaurantRouter

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);
app.use(express.json());
connectDB();

app.use("/api/admin", adminRouter); //admin routes
app.use("/api/restaurant", restaurantRouter); //restaurant router
app.use("/api/restaurant", dashboardRouter); //restaurant dashboard
app.use("/api/user", userRouter); //user routes
app.use("/api/browse", browseRouter);

app.get("/", (req, res) => res.send("Cayman Backend Running"));

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;
