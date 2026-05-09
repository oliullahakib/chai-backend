import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
const registerUser = async (req, res) => {
    //get user details from frontend - password,username,fullName,email
    const { email, password, username, fullName } = req.body
    //validation - undifiend
    if (
        [email, password, username, fullName].some(field => field === undefined)
    ) {
        throw new ApiError(400, 'email,password,username,fullName can not undifiend')
    }
    //validation - not empty
    if (
        [email, password, username, fullName].some(field => field?.trim() === "")
    ) {
        throw new ApiError(400, 'All field are required')
    }

    //check user already exist: username,email
    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exist")
    }
    //check for images: avatar
    const avatarLocalPath = req.files?.avatar[0]?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file required")
    }
    let coverImageLocalPath;
    if (req.files
        && Array.isArray(req.files.coverImage)
        && req.files.coverImage.length > 0
    ) 
    {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    // console.log("avatarLocalPath --->",avatarLocalPath)
    // console.log("coverImageLocalPath --->",coverImageLocalPath)
    // upload them to cloudinary: avatar, coverImage
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    //create user object - save to db
    const newUser = {
        username : username.toLowerCase(),
        fullName,
        email,
        password,
        avatar : avatar.url,
        coverImage : coverImage?.url || ""
    }
    const user = await User.create(newUser)
    //check user creation
    //remove password and refresh token from response
    const createdUser = await User.findById(user._id).select(" -password -refreshToken ")
    //return response
    // res.status(201).send({ message: "User Created Successfuly",data:createdUser })
   return res.status(201).json(
        new ApiResponse(200,createdUser,"User Created Successfuly")
    )
}
export { registerUser }