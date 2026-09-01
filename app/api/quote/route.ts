import {
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

    return Response.json({
      paid: true,
      txHash: gate.txHash,
      quote: {
        pair: "IDRX/USD",
        rate: "1",
        note: "Stateless paid JSON — this route never sets an access cookie.",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ error: message }, { status: 500 });
  }
}
