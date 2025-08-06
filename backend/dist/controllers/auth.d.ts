import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const signup: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const logout: (req: Request, res: Response) => Promise<void>;
export declare const getMe: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const oauthLogin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const resetPassword: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.d.ts.map