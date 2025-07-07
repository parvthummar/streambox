import { Router } from "express";
import { registeruser } from "../controllers/user.controller.js";

const userrouter = Router();

userrouter.route("/register").post(registeruser);

export default userrouter;  