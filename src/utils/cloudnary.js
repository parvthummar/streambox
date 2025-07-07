import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localfilepath)=>{
    try{
        if(!localfilepath) return null;
        //upload file on cloudinary
        const response = new cloudinary.uploader.upload(localfilepath , 
            {
                resource_type : "auto"
            }
        )
        console.log("file is uploaded" , response.url);
        return response;
    }catch(error){
        fs.unlinkSync(localfilepath) // remove the localy saved temporary file as upload operation is failed
        return null;
    }
}

export {uploadOnCloudinary};