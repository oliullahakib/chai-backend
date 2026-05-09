import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
    // Configuration
    cloudinary.config({ 
        cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
        api_key:process.env.CLOUDINARY_API_KEY, 
        api_secret:process.env.CLOUDINARY_API_SECRET
    });
const uploadOnCloudinary = async (LocalPath) => {
    // console.log("localPatch --->",LocalPath)
    try {
        if (!LocalPath) return null
        const result = await cloudinary.uploader.upload(LocalPath, { resource_type: "auto" })
        fs.unlinkSync(LocalPath)
        // console.log('cloudinar ---> ',result)
        return result
    } catch (error) {
        fs.unlinkSync(LocalPath)
        return null
    }
}

export {uploadOnCloudinary}