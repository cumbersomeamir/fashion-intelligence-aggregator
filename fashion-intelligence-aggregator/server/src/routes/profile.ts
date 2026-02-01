import { Router } from "express";
import { getProfile, postProfile } from "../controllers/profileController.js";

const router = Router();
router.get("/", getProfile);
router.post("/", postProfile);
export default router;
