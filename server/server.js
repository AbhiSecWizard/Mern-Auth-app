require("dotenv/config")        
const express = require("express")           
const cors = require("cors")           
const authRouter = require("./routes/authRouter")
const cookieParser = require("cookie-parser")
const connectDB = require("./config/mongodb")
const userRouter = require("./routes/userRouter")
const app = express()
const port = process.env.PORT || 5000

// <<<<<<< HEAD
const allowedOrigins =["http://localhost:5173"]
// =======
// const allowedOrigins =["https://authentication-app-1-nwtv.onrender.com"]
// >>>>>>> 608be7bbaff2e23fcf8e3cc560cd0fddf463ae91

app.use(express.json())
app.use(cookieParser())
app.use(cors({origin:allowedOrigins,
              credentials:true}))
              connectDB()

// API end Points

app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)

app.get("/",(req,res)=>{
    res.send("API WORKING")
})

app.listen(port,()=>{
    console.log(`server is running on PORT : ${port}`)
})