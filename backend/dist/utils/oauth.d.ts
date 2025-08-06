import { OAuthProvider, OAuthUserData } from '../types';
export declare class OAuthService {
    static verifyGoogleToken(accessToken: string): Promise<OAuthUserData>;
    static verifyOAuthToken(provider: OAuthProvider, accessToken: string): Promise<OAuthUserData>;
}
//# sourceMappingURL=oauth.d.ts.map