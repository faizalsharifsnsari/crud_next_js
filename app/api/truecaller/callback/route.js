export const runtime = "nodejs";

let verifiedUsers = {}; // simple in-memory store (for now)

export async function POST(request) {
  console.log("🔥 TRUECALLER POST HIT 🔥");
  try {
    const body = await request.json();

    console.log("---- TRUECALLER CALLBACK ----");
    console.log("Incoming body:", body);

    const { accessToken, endpoint, requestId, status } = body;

    // 1️⃣ Flow invoked (ignore)
    if (status === "flow_invoked") {
      console.log("Flow invoked:", requestId);
      return Response.json({ received: true }, { status: 200 });
    }

    // 2️⃣ User rejected
    if (status === "user_rejected") {
      console.log("User rejected verification:", requestId);
      return Response.json({ rejected: true }, { status: 200 });
    }

    // 3️⃣ Final verification (this is what you want)
    if (!accessToken || !endpoint || !requestId) {
      console.log("Not final verification payload");
      return Response.json({ ignored: true }, { status: 200 });
    }

    // 🔥 Fetch profile
    const profileRes = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profile = await profileRes.json();

    console.log("User verified successfully:", profile);

    verifiedUsers[requestId] = profile;

    return Response.json({ success: true });

  } catch (error) {
    console.error("Truecaller error:", error);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}

