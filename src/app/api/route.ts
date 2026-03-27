import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    name: "Eventify API",
    version: "1.0.0",
    description: "SaaS Event Management Platform API"
  });
}
