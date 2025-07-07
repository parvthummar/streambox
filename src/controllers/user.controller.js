import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudnary.js";
import {ApiResponse} from "../utils/apiResponce.js";

const registeruser = asyncHandler(async (req,res)=>{
    //get user details from front end
    //validation
    // check if user already exist
    //check for images, avatar
    //if available upload to cloudinary , 
    //create user object - create entry in db
    // check for user creation

    const {username , email , fullName , password} = req.body;
    
     if (!username?.trim()) {
        throw new ApiError(400, "Username is required");
    }
    if (!email?.trim()) {
        throw new ApiError(400, "Email is required");
    }
    if (!fullName?.trim()) {
        throw new ApiError(400, "Full name is required");
    }
    if (!password?.trim()) {
        throw new ApiError(400, "Password is required");
    }

    const existedUser = await User.findOne(
        {
            $or : [{username : username},{email : email}],
        }
    )
    if(existedUser){
        throw new ApiError(409,"user already exists");
    }

    console.log(req.files);
    
    const avatar_localpath = req.files?.avatar[0]?.path;
    const coverImage_localpath = req.files?.coverImage[0]?.path;

    if(!avatar_localpath){
        throw new ApiError(400 , "please proper avatar image");
    }

    const avatar_response = await uploadOnCloudinary(avatar_localpath);
    let coverImage_response = null;
    if(coverImage_localpath){
        coverImage_response = await uploadOnCloudinary(coverImage_localpath);
    }

    if(!avatar_response) throw new ApiError(500,"we are not able to upload avatar");


    const user = await User.create({
        fullName,
        avatar : avatar_response.url,
        coverImage : coverImage_response?.url || "",
        email,
        password,
        username : username.toLowerCase(),
    })

    const is_creates = await User.findById(user._id).select(
        "-password -referenceTokens"
    );

    if(!is_creates){
        throw new ApiError(500,"user is not creates in database");
    }

    return res.status(200).json(
        new ApiResponse(200,is_creates,"user created succesfully")
    )
})

export {registeruser};

