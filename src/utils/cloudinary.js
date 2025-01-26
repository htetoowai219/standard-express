import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Configuration
cloudinary.config({ 
    cloud_name: 'dxmpgnub2', 
    api_key: '418981418793822', 
    api_secret: process.env.CLOUDINARY_API_SECRET,
    // Click 'View API Keys' above to copy your API secret
});

export const uploadFileToCloudinary = async (filePath) => {
    try {
        if(!filePath) return null
        const response = await cloudinary.uploader
       .upload(
           filePath, {
               resource_type : "auto",
           }
       )
       console.log("File upload Complete", response.url);
       fs.unlinkSync(filePath);
       return (response.url);
    } catch (error) {
        console.log(error);
        fs.unlinkSync(filePath);
        return null;
    }
}

