import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import express from "express";
import cors from "cors";
import path from "path";
import { config as dotenvConfig } from "dotenv";

import { authMiddleware } from "./lib/auth";
import mediaRouter from "./api/media";
import imagesRouter from "./api/images";
import editsRouter from "./api/edits";
import storageRouter from "./api/storage";

// Load env from functions/.env and project root .env if present
try { dotenvConfig({ path: path.resolve(__dirname, "..", ".env") }); } catch {}
try { dotenvConfig({ path: path.resolve(__dirname, "..", "..", ".env") }); } catch {}

admin.initializeApp();

const app = express();
const corsOrigin: any = process.env.CORS_ORIGIN || true;
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: "20mb" }));

// Health
app.get("/", (_req, res) => res.json({ ok: true, service: "api" }));

// Local storage endpoints used by R2 helper in dev
app.use("/storage", storageRouter);

// Protected API (skippable via SKIP_AUTH=1 in .env for local dev)
app.use(authMiddleware);
app.use("/media", mediaRouter);
app.use("/images", imagesRouter);
app.use("/edits", editsRouter);

export const api = functions
  .region(process.env.FUNCTIONS_REGION || process.env.NEXT_PUBLIC_FIREBASE_LOCATION || "europe-west1")
  .https.onRequest(app);
