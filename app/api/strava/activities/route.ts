import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { fetchActivities, processSummaryActivity } from "@/lib/strava";

export async function GET(request: Request) {
  const session = await requireSession();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Token expired, please re-authenticate" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const perPage = Number(searchParams.get("per_page") ?? "20");

  try {
    const raw = await fetchActivities(session.accessToken, page, perPage);
    const activities = raw.map(processSummaryActivity);
    return NextResponse.json({ activities, page, perPage });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
