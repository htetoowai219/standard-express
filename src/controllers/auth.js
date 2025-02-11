import { uploadFileToCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import { User } from "../models/user.js";
import jwt from "jsonwebtoken";

// Registering New User
export const registerController = async (req, res) => {
  const { username, email, password } = req.body;

  if ([username, email, password].some((field) => field?.trim() === "")) {
    return res.status(400).json({ message: "All Fields are required." });
  }

  
  const profile_photo_path = req.files.profile_photo[0].path;
  const cover_photo_path = req.files.cover_photo[0].path;

  try {
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
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

const generateAccessTokenAndRefreshToken = async (userId, res) => {
  try {
    const existingUser = await User.findById(userId);

    if(!existingUser){
      return res.status(404).json({ message : "No User Found." }); 
    }

    const accessToken = await existingUser.generateAccessToken();
    const refreshToken = await existingUser.generateRefreshToken();

    existingUser.refresh_token = refreshToken;
    await existingUser.save({validateBeforeSave : false});

    return { accessToken, refreshToken };

  } catch (error) {
    console.log(error)
    return res.status(500).json({ message : "Something went wrong in generating tokens." });
  }
}

// User Login
export const loginController = async (req, res) => {
  const {email, username, password} = req.body;

  if(!email || !username || !password) {
    return res.status(400).json({message : "All Fields Required."});
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!existingUser) {
    return res.status(404).json({ message : "No User Found." });
  }

  const isPassMatch = await existingUser.isPasswordMatch(password);

  if (!isPassMatch) {
    return res.status(404).json({ message : "Invalid Crendentials." });
  }

  const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(existingUser._id, res);

  const loggedUser = await User.findById(existingUser._id).select("-password -refresh_token");

  const options = {
    httpOnly : true,
    secure : process.env.NODE_ENV === "production",
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({ user : loggedUser, message : "Login Success." });
}

// Update Refresh Token
export const generateNewRefreshToken = async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if(!incomingRefreshToken) {
    return res.status(401).json({ message : "No Refresh Token Found." });
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);
    
    const existingUser = await User.findById(decodedToken?._id);
    if(!existingUser) {
      return res.status(404).json({ message : "No User Found." });
    }

    if(incomingRefreshToken !== existingUser.refresh_token) {
      return res.status(401).json({ message : "Invalid Refresh Token." });
    }

    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(existingUser._id, res);

    const options = {
      httpOnly : true,
      secure : process.env.NODE_ENV === "production",
    }

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({ message : "Token Updated, Success." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message : "Something went wrong in generating new refresh token." });
  }
}

// Logout
export const logoutController = async (req, res) => {
  if(!req.user || !req.user._id){
    return res.status(400).json({ message : "Unauthorized." })
  }

  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset : {
          refresh_token : 1,
        }
      },
      { new : true }
    );

    const options = {
      httpOnly : true,
      secure : process.env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ message : `${req.user.username} Logged Out Successfully.` });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message : "Something went wrong." });
  }
}