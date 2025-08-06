import { Request, Response, NextFunction } from 'express';
export declare const validateSignup: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const validateLogin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const validateProfileUpdate: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const validatePasswordReset: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
//# sourceMappingURL=validation.d.ts.map