import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors());
app.use(express.json({limit : "100kb"})); 
app.use(express.urlencoded({extended:true}));
//app.use(express.static("public")); // to show static on listining url
app.use(cookieParser());


// routs

import userrouter from "./routs/user.routs.js";
// rout declaration
app.use("/users" , userrouter);



export {app};