import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../firebase';

export interface AuthenticatedRequest extends Request {
  user?: { uid: string; email?: string | null };
}

export async function verifyFirebaseToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring('Bearer '.length)
      : undefined;

    if (!token) {
      return res.status(401).json({ message: 'Missing Authorization header' });
    }

    const decoded = await firebaseAuth.verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email ?? null };
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}


