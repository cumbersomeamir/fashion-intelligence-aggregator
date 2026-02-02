import type { Request, Response } from "express";
import * as profileService from "../services/profileService.js";

export async function getProfile(req: Request, res: Response): Promise<void> {
  const sessionId = (req.query.sessionId as string)?.trim();
  if (!sessionId) {
    res.status(400).json({ error: "Missing query parameter: sessionId" });
    return;
  }
  try {
    const profile = await profileService.getProfile(sessionId);
    res.json(profile ?? {});
  } catch (err) {
    console.error("[profile get]", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}

export async function postProfile(req: Request, res: Response): Promise<void> {
  const payload = req.body as Record<string, unknown>;
  const sessionId = (payload.sessionId as string)?.trim();
  if (!sessionId) {
    res.status(400).json({ error: "Missing body field: sessionId" });
    return;
  }
  try {
    const profilePayload: profileService.ProfilePayload = {
      ...payload,
      sessionId,
    } as profileService.ProfilePayload;
    const saved = await profileService.saveProfile(profilePayload);
    res.json(saved);
  } catch (err) {
    console.error("[profile post]", err);
    res.status(500).json({ error: "Failed to save profile" });
  }
}
