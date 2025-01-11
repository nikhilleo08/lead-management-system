import express, { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { encryptData } from "../helpers/encryption";
import envConfig from "../config";

const auth: Router = express.Router();

auth.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

auth.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(400).json({ message: "User not authenticated" });
      }
  
      const user = req.user as { id: string; email: string; name: string };
      const encryptionKey = envConfig.ENCRYPTION_KEY.substring(0, 32); // Ensure 32-byte key

      // Encrypt sensitive fields
      const encryptedId = encryptData(user.id, encryptionKey);
      const encryptedEmail = encryptData(user.email, encryptionKey);
      const encryptedName = encryptData(user.name, encryptionKey);
  
      // Sign JWT with encrypted data
      const accessToken = jwt.sign(
        { id: encryptedId, email: encryptedEmail, name: encryptedName },
        envConfig.JWT_SECRET!,
        { expiresIn: "15m", algorithm: "HS256" }
      );
  
      const refreshToken = jwt.sign(
        { id: encryptedId, email: encryptedEmail, name: encryptedName },
        envConfig.JWT_REFRESH_SECRET!,
        { expiresIn: "7d" }
      );
  
      res.status(200).json({
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next({ status: 403, ...error })
    }
  }
);


// Refresh token endpoint
auth.post("/refresh", (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: "Refresh token required" });

  try {
    const { id, name, email } = jwt.verify(
      refreshToken,
      envConfig.JWT_REFRESH_SECRET
    ) as {
      id: string;
      email: string;
      name: string;
    };
    console.log(id, email, name);
    const newAccessToken = jwt.sign({id, name, email}, envConfig.JWT_SECRET, {
      expiresIn: '15m'
    });
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.log(error)
    next({ status: 403, ...error })
  }
});

export default auth;
