import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

const uploadOnCloudinary = async (localfilepath)=>{
    // console.log("this is api key" , process.env.CLOUDINARY_API_KEY);
    // console.log("this is api key" , process.env.CLOUDINARY_API_SECRET);
    // console.log("this is api key" , process.env.CLOUDINARY_CLOUD_NAME);

    cloudinary.config({   //hear was big error , because this config was taking time so , i have to put it  inside async function
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
      api_key: process.env.CLOUDINARY_API_KEY, 
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    try{
        if(!localfilepath) return null;
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localfilepath , 
            {
                resource_type : "auto"
            }
        )
        console.log("file is uploaded" , response.url);
        fs.unlinkSync(localfilepath) // if uploaded then delet it from server
        return response;

    }catch(error){
        console.log("errrorororr  id hear");
        fs.unlinkSync(localfilepath) // remove the localy saved temporary file as upload operation is failed
        return null;

    }
}

export {uploadOnCloudinary};