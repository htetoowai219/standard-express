import { Router } from "express";
import upload from "../middlewares/multer-storage.js";
import { verifyJWT } from "../middlewares/auth.js";
import { 
  loginController, 
  registerController, 
  generateNewRefreshToken, 
  logoutController 
} from "../controllers/auth.js";

const router = Router();

router.post(
  "/register",
  upload.fields([
    { name: "profile_photo", maxCount: 1 },
    { name: "cover_photo", maxCount: 1 },
  ]),
  registerController
);

router.post("/login", loginController);

router.post("/refresh", generateNewRefreshToken);

router.post("/logout", verifyJWT, logoutController);

export default router;
