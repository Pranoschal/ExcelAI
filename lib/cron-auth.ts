import { NextRequest } from "next/server";

export function verifyCronSecret(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }

  const authorization = req.headers.get("authorization");
  if (authorization === `Bearer ${secret}`) {
    return true;
  }

  const cronHeader = req.headers.get("x-cron-secret");
  if (cronHeader === secret) {
    return true;
  }

  return false;
}
