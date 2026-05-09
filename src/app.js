import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()

// configur
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({limit:"16kb",extended:true}))
app.use(express.static('public'))
app.use(cookieParser())

// router import 
import userRouter from "./routers/user.routers.js"
app.use("/api/v1/users",userRouter)
// http://localhost:8000/api/v1/users/
export {app}