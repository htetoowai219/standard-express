import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

export const verifyJWT = async (req, res, next) => {
  const incomingToken = req.cookies.accessToken || req.header("Authorization");

  if (!incomingToken) {
    res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decodedToken = jwt.decode(incomingToken);

    if (!decodedToken._id) {
      res.status(401).json({ message: "Unauthorized" });
    }

    const existingUser = await User.findById(decodedToken._id).select(
      "-password -refresh_token"
    );

    if (!existingUser) {
      res.status(401).json({ message: "Unauthorized" });
    }

    req.user = existingUser;

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const verifyPassword = async (req, res, next) => {
  const password = req.body.password;

  if (!password) {
    return res.status(401).json({ message: "Password Required." });
  }

  const existingUser = await User.findById(req.user._id).select(
    "-refresh_token"
  );

  if (!existingUser) {
    res.status(401).json({ message: "Unauthorized" });
  }

  const isPassMatch = await existingUser.isPasswordMatch(password);

  if (!isPassMatch) {
    return res.status(404).json({ message : "Old Password is Wrong." });
  }

  next();

};
