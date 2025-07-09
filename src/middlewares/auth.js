import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import pkg from "jsonwebtoken";
const {jwt} = pkg;
import { User } from "../models/user.model.js";

const varifyJwt = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.access_token || req.header("Authorization")?.replace("Bearer ","")
        
        if(!token) throw new ApiError(401 ,"token is not found");
    
        const decoded_token = await jwt.varify(token , process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decoded_token?._id).select(
            "-password -referenceTokens"
        )
    
        if(!user) throw new ApiError(401 , "invelid access token");
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid access token");
    }

})

export {varifyJwt};