import mongoose, { Schema } from "mongoose";
import pkg from "jsonwebtoken";
const {jwt} = pkg;
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    username :{
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim:true,
        index:true,
    },
    email :{
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim:true,
    },
    fullName :{
        type : String,
        required : true,
        trim:true,
        index:true,
    },
    avatar :{
        type : String, // other urls
        required : true,
    },
    coverImage :{
        type : String, // other urls
    },
    watchHistory :[
        {
            type : Schema.Types.ObjectId,
            ref:"Video",
        }
    ],
    password :{
        type: String,
        required : [true , "password is required"],

    },
    referenceTokens :{
        type : String,

    }
},{timestamps : true})


//pre is like .use in express
userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next();
    }
    this.password = await bcrypt.hash(this.password , 10)
    next();
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
            username : this.username,
            fullName : this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
} 
userSchema.methods.generateRefreshToken  = function(){
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema);
// this User class extends to mongoose.model class
// mongoose built User class based on userSchema provided by us