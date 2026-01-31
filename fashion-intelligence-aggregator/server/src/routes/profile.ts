import { Router } from "express";
import { postProfile } from "../controllers/profileController.js";

const router = Router();
router.post("/", postProfile);
export default router;
