import mongoose from 'mongoose';
import {DB_NAME} from '../constants.js';

const connectDB = async ()=>{
    try{
        //console.log("Connecting to:", `${process.env.MONGODB_URI}/${DB_NAME}`);
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`db is connected : ${connectionInstance.connection.host}`);
    }
    catch(err){
        console.error("error",err);
        process.exit(1);
    }
}

export default connectDB;