import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { decryptData } from './encryption';
import envConfig from '../config';

interface user {
  id: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: user;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'] as string;
  const token = authHeader && authHeader.split(' ')[1];
  console.log(token)
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, envConfig.JWT_SECRET!) as {
      id: string;
      email: string;
      name: string;
    };

    const encryptionKey = envConfig.ENCRYPTION_KEY.substring(0, 32);;

    const decryptedId = decryptData(decoded.id, encryptionKey);
    const decryptedEmail = decryptData(decoded.email, encryptionKey);
    const decryptedName = decryptData(decoded.name, encryptionKey);

    req.user = { id: decryptedId, email: decryptedEmail, name: decryptedName };
    next();
  } catch (error) {
    console.error("Token Verification Error:", error);
    next({ status: 403, ...error });
  }
};

// import { NextFunction, Request } from "express";
// import { decryptData } from "./encryption";
// import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}


// export const authenticateToken = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader?.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({ message: "No token provided" });
//   }

//   try {
//     const decoded = jwt.verify(token, envConfig.JWT_SECRET!) as {
//       id: string;
//       email: string;
//       name: string;
//     };

//     const encryptionKey = envConfig.ENCRYPTION_KEY!;
//     const decryptedEmail = decryptData(decoded.email, encryptionKey);
//     const decryptedName = decryptData(decoded.name, encryptionKey);

//     req.user = { id: decoded.id, email: decryptedEmail, name: decryptedName };
//     next();
//   } catch (error) {
//     console.error("Token Verification Error:", error);
//     res.status(403).json({ message: "Invalid or expired token" });
//   }
// };
