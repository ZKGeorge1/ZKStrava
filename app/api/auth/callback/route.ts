import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const STRAVA_CLIENT_ID = '125671';
const STRAVA_CLIENT_SECRET = '22983e75108c77f8b18fa805a1e8ee8fcfa3f9aa';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  try {
    // Exchange code for token
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
    });

    const { access_token, athlete } = response.data;

    // Redirect back with token in URL (will be stored in browser)
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('token', access_token);
    redirectUrl.searchParams.set('athlete', JSON.stringify(athlete));

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }
}
