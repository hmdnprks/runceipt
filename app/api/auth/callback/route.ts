import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  // Exchange code for token
  const tokenRes = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/?error=token_failed", request.url));
  }

  const data = await tokenRes.json();

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  session.accessToken = data.access_token;
  session.athleteId = String(data.athlete.id);
  session.athleteName = `${data.athlete.firstname} ${data.athlete.lastname}`;
  session.athleteImage = data.athlete.profile_medium;
  await session.save();

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
