
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/mongodb");
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");
const sendMail = require("./config/brevoMail");

const app = express();

const PORT = process.env.PORT || 5000;

// ========================
// Middleware
// ========================

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    "http://localhost:5173",
    "https://authentication-app-5t7a.onrender.com",
    
];

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.set("trust proxy", 1);

// ========================
// Routes
// ========================

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.set("etag", false);

app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// ========================
// Test Routes
// ========================

app.get("/", (req, res) => {
    res.status(200).send("API WORKING");
});

app.get("/mail-test", async (req, res) => {
    try {
        await sendMail(
            "studyandrotech@gmail.com",
            "Test",
            "Brevo API working"
        );

        res.status(200).send("Mail sent");
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// ========================
// Start Server
// ========================

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on PORT: ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();