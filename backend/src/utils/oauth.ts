import axios from 'axios';
import { OAuthProvider, OAuthUserData } from '../types';

export class OAuthService {
  static async verifyGoogleToken(accessToken: string): Promise<OAuthUserData> {
    try {
      console.log('Verifying Google token:', accessToken.substring(0, 50) + '...');
      
      // Handle Supabase OAuth tokens
      if (accessToken.includes('.')) {
        // This is a JWT token from Supabase OAuth
        try {
          const parts = accessToken.split('.');
          if (parts.length !== 3) {
            console.error('Invalid JWT format - expected 3 parts, got:', parts.length);
            throw new Error('Invalid JWT format');
          }
          
          // Decode the payload part (second part)
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          console.log('JWT payload:', JSON.stringify(payload, null, 2));
          
          // Extract user information from Supabase JWT
          // Try different possible field names for user ID
          const userId = payload.sub || payload.user_id || payload.aud || payload.user?.id || payload.id;
          const email = payload.email || payload.user?.email;
          const name = payload.name || payload.full_name || payload.user_metadata?.full_name || payload.user?.user_metadata?.full_name || email;
          const picture = payload.picture || payload.avatar_url || payload.user_metadata?.avatar_url || payload.user?.user_metadata?.avatar_url;
          
          console.log('Extracted user data:', { userId, email, name, picture });
          
          if (!userId || !email) {
            console.error('Missing required user information in JWT');
            console.error('Available fields in payload:', Object.keys(payload));
            throw new Error('Missing required user information in JWT');
          }
          
          return {
            id: userId,
            email: email,
            name: name,
            picture: picture,
          };
        } catch (jwtError) {
          console.error('JWT parsing error:', jwtError);
          throw new Error('Invalid JWT token format');
        }
      }

      // Handle demo tokens for testing
      if (accessToken.startsWith('simple_google_auth_')) {
        const timestamp = accessToken.split('_')[2];
        const userNumber = parseInt(timestamp) || 123; // Use fallback for NaN
        
        return {
          id: `google_user_${timestamp}`, // Use full timestamp for unique ID
          email: `google.user${timestamp}@example.com`, // Use timestamp for unique email
          name: `Google User ${userNumber}`,
          picture: `https://ui-avatars.com/api/?name=G${userNumber}&background=4285f4&color=ffffff&size=150`,
        };
      }

      // Try to fetch real Google profile data using Google People API
      try {
        const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        const userData = response.data;
        console.log('Google userinfo response:', userData);

        // Try to get additional profile data from Google People API
        let additionalData = null;
        try {
          const peopleResponse = await axios.get('https://people.googleapis.com/v1/people/me?personFields=birthdays,genders,names,photos,emailAddresses', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          additionalData = peopleResponse.data;
          console.log('Google People API response:', additionalData);
        } catch (peopleError) {
          console.log('Could not fetch additional profile data from Google People API:', peopleError);
        }

        // Extract age and gender from additional data if available
        let age: number | undefined;
        let gender: string | undefined;

        if (additionalData) {
          // Extract birthday and calculate age
          const birthdays = additionalData.birthdays;
          if (birthdays && birthdays.length > 0) {
            const birthday = birthdays[0].date;
            if (birthday) {
              const birthDate = new Date(birthday.year, birthday.month - 1, birthday.day);
              const today = new Date();
              age = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
              }
            }
          }

          // Extract gender
          const genders = additionalData.genders;
          if (genders && genders.length > 0) {
            gender = genders[0].value;
          }
        }

        return {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          picture: userData.picture,
          age: age,
          gender: gender,
        };
      } catch (googleError) {
        console.error('Error fetching Google profile data:', googleError);
        
        // Fallback for demo purposes
        return {
          id: `google_user_999`,
          email: `demo.google999@example.com`,
          name: `Demo Google User 999`,
          picture: `https://ui-avatars.com/api/?name=G999&background=4285f4&color=ffffff&size=150`,
        };
      }
    } catch (error) {
      console.error('Google auth verification error:', error);
      throw new Error('Invalid Google auth token');
    }
  }

  static async verifyOAuthToken(
    provider: OAuthProvider,
    accessToken: string
  ): Promise<OAuthUserData> {
    switch (provider) {
      case OAuthProvider.GOOGLE:
        return this.verifyGoogleToken(accessToken);
      default:
        throw new Error(`Unsupported auth provider: ${provider}`);
    }
  }
} 