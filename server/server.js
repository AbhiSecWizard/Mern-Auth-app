require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/mongodb");
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");

const app = express();
const port = process.env.PORT || 5000;

// ✅ DB Connect
connectDB();

// ✅ Middlewares
app.use(express.json());
app.use(cookieParser());

// ✅ Dynamic CORS (dev + prod)
const allowedOrigins = [
  "http://localhost:5174",
  process.env.CLIENT_URL, // production client URL
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ✅ API Routes FIRST
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// ✅ Health route (optional)
app.get("/api/health", (req, res) => {
  res.send("API WORKING");
});

// ✅ Serve React build AFTER api routes
const __dirname1 = path.resolve();
app.use(express.static(path.join(__dirname1, "client", "dist")));

app.use((req, res) => {
  res.sendFile(path.join(__dirname1, "client", "dist", "index.html"));
});

// ✅ Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});