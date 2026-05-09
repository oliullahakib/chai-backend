import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import {cookieOption} from "../utils/cookieOption.js"
const generateAccessAndRefreshToken = async(userId) => {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })
    return { accessToken, refreshToken }
}

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
    ) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    // console.log("avatarLocalPath --->",avatarLocalPath)
    // console.log("coverImageLocalPath --->",coverImageLocalPath)
    // upload them to cloudinary: avatar, coverImage
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    //create user object - save to db
    const newUser = {
        username: username.toLowerCase(),
        fullName,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    }
    const user = await User.create(newUser)
    //check user creation
    //remove password and refresh token from response
    const createdUser = await User.findById(user._id).select(" -password -refreshToken ")
    //return response
    // res.status(201).send({ message: "User Created Successfuly",data:createdUser })
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Created Successfuly")
    )
}
const loginUser = async (req, res) => {
    //getting data from frontend - password, email, username
    const { password, email, username } = req.body
    if (!(email || username)) {
        throw new ApiError(400, "username or email is required")
    }
    //find the user
    const user = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (!user) {
        throw new ApiError(404, "User does not exist")
    }
    //check password
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentails")
    }
    //access and refresh token
    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id)
   const loggedInUser =  await User.findById(user._id).select("-password -refreshToken")
    //send cookie
    res
        .status(200)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .json(
            new ApiResponse
                (200,
                {
                   user: loggedInUser,refreshToken,accessToken
                },
                "User logged in successfully"
                )
        )
}
export { registerUser, loginUser }