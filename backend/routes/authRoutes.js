import express from 'express';
import { loginUser, registerUser, logoutUser} from "../controllers/authController.js";


const router = express.Router();

// Auth Routes
router.post("/register");
router.post("/login", loginUser);
router.post("logout", logoutUser);

export default router;
