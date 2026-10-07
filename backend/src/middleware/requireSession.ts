import type { Request, Response, NextFunction } from "express";
import { descopeClient } from "../config/descope.js";
import { ensureUser } from "../repositories/user.repository.js";

export type AuthContext = {
  authUserId: string;
  email?: string;
  name?: string;
  userId: string;
  token: Record<string, unknown>;
};

declare module "express-serve-static-core" {
  interface Request {
    auth?: AuthContext & Record<string, any>;
  }
}

export async function requireSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ")
    ? header.slice("Bearer ".length).trim()
    : null;

  if (!token) {
    res.status(401).json({ error: "Unauthorized", success: false });
    return;
  }

  let claims: Record<string, unknown>;
  let authUserId: string;

  try {
    const authInfo = await descopeClient.validateSession(token);
    if (!authInfo || !authInfo.token) {
      res.status(401).json({ error: "session expired", success: false });
      return;
    }

    claims = authInfo.token as Record<string, unknown>;
    authUserId = String(claims.sub ?? "");
  } catch (err) {
    console.error("Descope session validation error:", err);
    res.status(401).json({ error: "session expired" });
    return;
  }

  try {
    const email = typeof claims.email === "string" ? claims.email : undefined;
    const user = await ensureUser({ authUserId, email });

    // add auth info in ur req object
    req.auth = {
      authUserId,
      email,
      name: typeof claims.name === "string" ? claims.name : undefined,
      userId: user.id,
      token: claims,
    };

    next();
  } catch (err) {
    console.error("Database error in requireSession (ensureUser):", err);
    res.status(503).json({
      error: "Database unavailable. Please ensure PostgreSQL is running.",
    });
  }
}
