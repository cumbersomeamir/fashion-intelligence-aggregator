import type { Request, Response } from "express";
import * as profileService from "../services/profileService.js";

export function postProfile(req: Request, res: Response): void {
  const payload = req.body as Record<string, unknown>;
  const saved = profileService.saveProfile(payload);
  res.json(saved);
}
