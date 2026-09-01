import { getTransX402 } from "@/lib/transx402/server";

export async function GET(request: Request) {
  try {
    const tx402 = getTransX402();
    return tx402.config.handleRequest(request, {
      isConfigured: () => true,
    });
  } catch {
    return Response.json(
      { error: "TransX402 is not configured" },
      { status: 503 }
    );
  }
}
