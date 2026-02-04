import { cookies } from "next/headers";

// Server-side function to get the current session
// Since Better Auth is hosted externally at kael.im, we need to validate the session there
export async function getServerSession() {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('better-auth.session_token')?.value;

    if (!sessionToken) {
      return null;
    }

    // For now, we'll decode the JWT to get user info
    // In production, you should validate this with the Better Auth server
    const parts = sessionToken.split('.');
    if (parts.length !== 3) {
      return null;
    }

    try {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      return {
        user: {
          id: payload.sub || payload.id,
          email: payload.email,
          name: payload.name,
          image: payload.image || payload.avatar,
        }
      };
    } catch (error) {
      console.error('Error parsing session token:', error);
      return null;
    }
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
}