import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudnary.js";
import {ApiResponse} from "../utils/apiResponce.js";
import jwt from "jsonwebtoken";
import { log } from "console";

const registeruser = asyncHandler(async (req,res)=>{
    //get user details from front end
    //validation
    // check if user already exist
    //check for images, avatar
    //if available upload to cloudinary , 
    //create user object - create entry in db
    // check for user creation
    //console.log(req.body);
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

    //console.log(req.files);
    
    const avatar_localpath = req.files?.avatar[0]?.path;
    const coverImage_localpath = req.files?.coverImage[0]?.path;

    if(!avatar_localpath){
        throw new ApiError(400 , "please proper avatar image");
    }
    // In your controller, try logging the exact path being passed
    //console.log("Exact file path being sent:", avatar_localpath);

    const avatar_response = await uploadOnCloudinary(avatar_localpath); // image uploading on cloudinary
    let coverImage_response = null;
    if(coverImage_localpath){
        coverImage_response = await uploadOnCloudinary(coverImage_localpath);
    }

    if(!avatar_response) throw new ApiError(500,"we are not able to upload avatar");


    const user = await User.create({  // creating user in database(mongodb)
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
        throw new ApiError(500,"user is not created in database");
    }

    return res.status(200).json(
        new ApiResponse(200,is_creates,"user created succesfully")
    )
})


const generateAccessAndRefreshToken = async(user_details)=>{
    try{
        console.log(("before genetra"));
        
        const access_token = user_details.generateAccessToken();
        const refresh_token = user_details.generateRefreshToken();

        // console.log("access_token is " , access_token);
        // console.log("refresh token is " , refresh_token);
        
        user_details.referenceTokens = refresh_token;
        await user_details.save({validateBeforeSave : false}); // saving on mongodb database without any validation

        return {access_token , refresh_token};

    }catch(err){
        throw new ApiError(500,"something went wrong while generating tokens");
    }
}

const loginUser = asyncHandler(async (req,res)=>{
    //req body data
    //username or email
    //find the user , if user exist check password
    //access and refresh tokens
    //send cookies , and send a success response
    //console.log(req.body);
    
    const {username , email ,password} = req.body;

    if(!(username || email)) throw new ApiError(400,"atleast one of username or email is required");

    const user_details = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user_details) throw new ApiError(404,"user does not exist");

    const is_password_correct = await user_details.isPasswordCorrect(password);

    if(!is_password_correct) throw new ApiError(401,"password is not correct");

    console.log(user_details);
    

    const {access_token , refresh_token} = await generateAccessAndRefreshToken(user_details);

    const logedinuser = await User.findById(user_details._id).select(
        "-password -referenceTokens"
    )

    const opstions = {
        httpOnly : true,
        secure : true,
    }

    return res
  .status(200)
  .cookie("accessToken", access_token, opstions)
  .cookie("refreshToken", refresh_token, opstions)
  .json(
    new ApiResponse(
      200,
      {
        user_details: logedinuser.toObject(), //use toObject()
        access_token,
        refresh_token,
      },
      "user logedin successfully",
    )
  );

})

const logoutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                referenceTokens : undefined,
            }
        },
        {
            new : true,
        }
    )
    const opstions = {
        httpOnly : true,
        secure : true,
    }

    return res
    .status(200)
    .clearCookie("accessToken",opstions)
    .clearCookie("refreshToken",opstions)
    .json(new ApiResponse(200,{},"user logged out"))

})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    // console.log("helloo");
    
    //console.log(req.cookies);
    
    const  incoming_refreshToken = req.cookies?.refreshToken || req.body.refreshToken
    if(!incoming_refreshToken) throw new ApiError(401,"unauthorised request");

    //console.log("hear");
    

    const decoded_token = jwt.verify(
        incoming_refreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    const current_user = await User.findById(decoded_token?._id);
    if(!current_user) throw new ApiError(401,"invalid refresh-token");

    if(incoming_refreshToken !== current_user?.referenceTokens){
        throw new ApiError(401,"refresh token is expired or used");
    }

    const opstions ={
        httpOnly : true,
        secure : true
    }

    const {access_token,refresh_token} = await generateAccessAndRefreshToken(current_user)

    return res
    .status(200)
    .cookie("accessToken",access_token,opstions)
    .cookie("refreshToken",refresh_token,opstions)
    .json(
        new ApiResponse(
            200,
            {access_token , refresh_token},
            "Access token refreshed succefully"
        )
    )
})

const changeCurrentPassword = asyncHandler(async (req,res)=>{
    const {oldPassword , newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect) throw new ApiError(401 , "wrong password")

    user.password = newPassword
    await user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"password is changed succefully"))
})

export {registeruser , loginUser ,logoutUser , refreshAccessToken ,changeCurrentPassword};

