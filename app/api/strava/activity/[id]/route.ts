import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { fetchActivity, processActivity } from "@/lib/strava";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const activityId = Number(id);

  if (isNaN(activityId)) {
    return NextResponse.json({ error: "Invalid activity ID" }, { status: 400 });
  }

  try {
    const raw = await fetchActivity(session.accessToken, activityId);
    const activity = processActivity(raw);
    return NextResponse.json({ activity });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
