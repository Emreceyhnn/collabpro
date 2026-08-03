import { NextResponse } from "next/server";

export interface HealthResponse {
  status: "ok";
  timestamp: string;
  uptime: number;
}

export async function GET() {
  const payload: HealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };

  return NextResponse.json(payload);
}
