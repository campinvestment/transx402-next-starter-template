import { ARTICLE_RESOURCE_ID } from "@/lib/article";
import { setAccessCookie } from "@/lib/transx402/access-cookie";
import {
  extractPayerFromRequest,
  gateRequest,
  getPriceIdr,
  jsonFromUnsettledGate,
} from "@/lib/transx402/server";

export async function GET(request: Request) {
  try {
    const gate = await gateRequest(request, {
      priceIdr: getPriceIdr(),
      resourceUrl: request.url,
    });
    if (gate.kind !== "settled") {
      return jsonFromUnsettledGate(gate);
    }

    await setAccessCookie({
      resourceId: ARTICLE_RESOURCE_ID,
      payer: extractPayerFromRequest(request),
      txHash: gate.txHash,
    });

    return Response.json({
      paid: true,
      txHash: gate.txHash,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ error: message }, { status: 500 });
  }
}
