import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

export async function GET() {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    accessToken: session.accessToken,
    athleteId: session.athleteId,
    name: session.athleteName,
    image: session.athleteImage,
  });
}