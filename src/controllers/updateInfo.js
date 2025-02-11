import { uploadFileToCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import { User } from "../models/user.js";
import jwt from "jsonwebtoken";

export const updateEmailController = async (req, res) => {
    const { newEmail } = req.body;

    if(!newEmail){
        return res.status(404).json({ message : "The email to be changed not found."});
    }
    
    try {
        const existingUser = await User.findById(req.user._id);

        if(!existingUser) {
            return res.status(404).json({ message : "No User Found." });
        }

        existingUser.email = newEmail;
        await existingUser.save({validateBeforeSave : false});

        const options = {
            httpOnly : true,
            secure : process.env.NODE_ENV === "production",
        }
      
        return res
            .status(200)
            .json({ message : "Email Changed Successfully." });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message : "Something went wrong in changing email." });
    }
};

export const updatePasswordController = async (req, res) => {
    const { newPassword } = req.body;

    if(!newPassword){
        return res.status(404).json({ message : "The password to be changed not found."});
    }
    
    try {
        const existingUser = await User.findById(req.user._id);

        if(!existingUser) {
            return res.status(404).json({ message : "No User Found." });
        }


        existingUser.password = newPassword;
        await existingUser.save({validateBeforeSave : false});

        const options = {
            httpOnly : true,
            secure : process.env.NODE_ENV === "production",
        }
      
        return res
            .status(200)
            .json({ message : "Password Changed Successfully." });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message : "Something went wrong in changing password." });
    }
};