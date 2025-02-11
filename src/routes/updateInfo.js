import { Router } from "express";
import { verifyJWT, verifyPassword } from "../middlewares/auth.js";
import { updateEmailController, updatePasswordController } from "../controllers/updateInfo.js";

const router = Router();

router.patch("/email", verifyJWT, verifyPassword, updateEmailController);

router.patch("/password", verifyJWT, verifyPassword, updatePasswordController);

export default router;