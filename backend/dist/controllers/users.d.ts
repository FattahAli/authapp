import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const updateProfile: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getAllUsers: (req: Request, res: Response) => Promise<void>;
export declare const getUserById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=users.d.ts.map