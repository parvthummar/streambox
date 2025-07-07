import dotenv from 'dotenv';
dotenv.config({
    path: './.env'
});

import connectDB from "./db/index.js";
import {app} from './app.js'



connectDB()
.then(()=>{
    app.listen(process.env.PORT || 5000 , ()=>{
        console.log("server is running");
    } );
})
.catch((err)=>{
    console.log("Mongo db connection failde !!!");
})