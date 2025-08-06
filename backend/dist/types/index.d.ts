import { Request } from 'express';
export interface User {
    id: string;
    email: string;
    password?: string;
    name: string;
    age?: number;
    gender?: Gender;
    profilePicture?: string;
    oauthProvider?: OAuthProvider;
    oauthId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserWithoutPassword {
    id: string;
    email: string;
    name: string;
    age?: number;
    gender?: Gender;
    profilePicture?: string;
    oauthProvider?: OAuthProvider;
    oauthId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER",
    PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY"
}
export declare enum OAuthProvider {
    FACEBOOK = "FACEBOOK",
    GOOGLE = "GOOGLE"
}
export interface SignupRequest {
    email: string;
    password: string;
    name: string;
    age: number | string;
    gender: Gender;
    profilePicture?: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface OAuthLoginRequest {
    provider: OAuthProvider;
    accessToken: string;
}
export interface UpdateProfileRequest {
    name?: string;
    age?: number | string;
    gender?: Gender;
    profilePicture?: string;
}
export interface AuthenticatedRequest extends Request {
    user?: UserWithoutPassword;
}
export interface JWTPayload {
    userId: string;
    email: string;
}
export interface CloudinaryResponse {
    secure_url: string;
    public_id: string;
}
export interface OAuthUserData {
    id: string;
    email: string;
    name: string;
    picture?: string;
    age?: number;
    gender?: string;
}
//# sourceMappingURL=index.d.ts.map