import { uploadFileToCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import { User } from "../models/user.js";

export const registerController = async (req, res) => {
  const { username, email, password } = req.body;

  if ([username, email, password].some((field) => field?.trim() === "")) {
    return res.status(400).json({ message: "All Fields are required." });
  }

  
  const profile_photo_path = req.files.profile_photo[0].path;
  const cover_photo_path = req.files.cover_photo[0].path;

  try {
    const existingUsers = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUsers) {
        res
            .status(409)
            .json({ message: "Email or Username is already used by someone." });
        throw new Error("Email or Username is already used by someone.")
    }

    let profile_photo = "";
    let cover_photo = "";

    if (profile_photo_path && cover_photo_path) {
      const profile_photo = await uploadFileToCloudinary(profile_photo_path);
      const cover_photo = await uploadFileToCloudinary(cover_photo_path);
    }

    const user = await User.create({
      email,
      username: username.toLowerCase(),
      password,
      profile_photo,
      cover_photo,
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refresh_token"
    );

    if (!createdUser) {
      return res
        .status(500)
        .json({ message: "Something went wrong in registering new user." });
    }

    return res
      .status(200)
      .json({ userInfo: createdUser, message: "Registration Success." });
  } catch (error) {
    console.log(error);
    fs.unlinkSync(profile_photo_path);
    fs.unlinkSync(cover_photo_path);
  }
};
