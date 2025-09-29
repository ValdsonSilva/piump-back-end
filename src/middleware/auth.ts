import { UserType } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { env } from "../env.js";

export interface AuthPayload { sub: string, password: string, type: UserType }

export function signToken(payload: AuthPayload) {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: (env.JWT_EXPIRES_IN) });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer')) return res.status(401).json({ error: 'Missing bearer token' });

    const token = header.slice(7);

    try {
        const decode = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
        (req as any).auth = decode;
        next();
    } catch {
        return res.status(500).json({ error: "Invalid token" });
    }
}

export function requireUserType(...types: UserType[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const auth = (req as any).auth as AuthPayload | undefined;
        if (!auth) return res.status(401).json({ error: 'Unauthenticated' });
        if (!types.includes(auth.type)) return res.status(403).json({ error: 'Forbidden' });
        next();
    };
}