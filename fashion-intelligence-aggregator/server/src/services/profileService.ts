import { ProfileModel } from "../models/Profile.js";

/** Payload from frontend: sessionId + profile fields (no _id) */
export interface ProfilePayload {
  sessionId: string;
  measurements?: {
    height?: number;
    weight?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    shoulder?: number;
    inseam?: number;
  };
  fitPreference?: string;
  sleevePreference?: string;
  lengthPreference?: string;
  budgetTier?: string;
  budgetSensitivity?: string;
  occasions?: string[];
  occasionFrequency?: string;
  fabricPrefs?: string[];
  fabricSensitivities?: string[];
  climate?: string;
  favoriteBrands?: string[];
  brandsToAvoid?: string[];
  stylePrefs?: string[];
  profile_image?: string;
}

function payloadToDoc(payload: ProfilePayload): Record<string, unknown> {
  const { sessionId, ...rest } = payload;
  return { sessionId, ...rest };
}

function docToProfile(doc: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!doc) return null;
  const { _id, __v, createdAt, updatedAt, sessionId, ...profile } = doc;
  return profile;
}

export async function saveProfile(payload: ProfilePayload): Promise<Record<string, unknown>> {
  const { sessionId, ...profileData } = payload;
  const doc = await ProfileModel.findOneAndUpdate(
    { sessionId },
    { $set: payloadToDoc(payload) },
    { new: true, upsert: true, runValidators: true }
  ).lean();
  return docToProfile(doc as Record<string, unknown>) ?? profileData;
}

export async function getProfile(sessionId: string): Promise<Record<string, unknown> | null> {
  const doc = await ProfileModel.findOne({ sessionId }).lean();
  return doc ? docToProfile(doc as Record<string, unknown>) : null;
}
