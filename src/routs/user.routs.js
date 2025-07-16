import { Router } from "express";
import { registeruser , loginUser ,logoutUser , refreshAccessToken ,changeCurrentPassword} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import {varifyJwt} from "../middlewares/auth.js";

const userrouter = Router();

userrouter.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1,
        },
        {
            name : "coverImage",
            maxCount : 1,
        }
    ]),
    registeruser
);

// if using form data use multer
userrouter.route("/login").post( upload.none() ,loginUser);

userrouter.route("/logout").post(varifyJwt , logoutUser);

userrouter.route("/refresh-token").post(refreshAccessToken);

userrouter.route("/change-password").post(upload.none() , varifyJwt , changeCurrentPassword);

export default userrouter;  