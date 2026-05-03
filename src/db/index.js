import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const conntedToDB = async()=>{
try {
  const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//   console.log(connectionInstance)
  console.log(`MongoDB connection !! DB Host: ${connectionInstance.connection.host}`);
  
} catch (error) {
    console.log("MongoDB connection faild",error);
    throw error
}
}
export default conntedToDB