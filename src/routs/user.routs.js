import { Router } from "express";
import { registeruser , loginUser ,logoutUser } from "../controllers/user.controller.js";
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

export default userrouter;  