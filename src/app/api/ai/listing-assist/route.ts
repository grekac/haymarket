import { NextRequest, NextResponse } from "next/server";
import { assistListing } from "@/lib/ai-listing";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await assistListing(body);
  return NextResponse.json(result);
}
