import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to get OAuth configuration
export async function getOAuthConfig() {
  try {
    // For now, we'll use environment variables
    // In a production app, you might want to fetch this from your backend
    // which can securely access Supabase admin API
    return {
      google: {
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      }
    };
  } catch (error) {
    console.error('Error fetching OAuth configuration:', error);
    return null;
  }
}

// Function to sign in with Google using Supabase
export async function signInWithGoogle() {
  try {
    // Use environment variable for production, fallback to window.location.origin for development
    const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      : `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/auth/callback`;
    
    console.log('Google OAuth redirect URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

// Function to handle OAuth callback
export async function handleOAuthCallback() {
  try {
    // Get the session from the URL hash or query params
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase session error:', error);
      throw error;
    }

    // If no session, try to get it from the URL
    if (!data.session) {
      const { data: urlData, error: urlError } = await supabase.auth.getUser();
      
      if (urlError) {
        console.error('Supabase user error:', urlError);
        throw urlError;
      }

      if (urlData.user) {
        // Create a session-like object
        return {
          session: {
            user: urlData.user,
            access_token: urlData.user.id, // Use user ID as token for now
            refresh_token: '',
            expires_in: 3600,
            token_type: 'bearer',
            user_metadata: urlData.user.user_metadata || {}
          }
        };
      }
    }

    return data;
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    throw error;
  }
} 