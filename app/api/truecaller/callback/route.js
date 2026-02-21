export const runtime = "nodejs";

export async function POST(request) {
  console.log("🔥 TRUECALLER POST HIT 🔥");

  try {
    const body = await request.json();
    console.log("---- RAW TRUECALLER BODY ----");
    console.log(JSON.stringify(body, null, 2));

    const { accessToken, endpoint, requestId, status } = body;

    // 1️⃣ Flow invoked (ignore but log)
    if (status === "flow_invoked") {
      console.log("Flow invoked for:", requestId);
      return Response.json({ received: true }, { status: 200 });
    }

    // 2️⃣ User rejected
    if (status === "user_rejected") {
      console.log("User rejected verification:", requestId);
      return Response.json({ rejected: true }, { status: 200 });
    }

    // 3️⃣ If no accessToken, just acknowledge
    if (!accessToken || !endpoint || !requestId) {
      console.log("Not final verification payload.");
      return Response.json({ ignored: true }, { status: 200 });
    }

    // 🔥 FINAL VERIFICATION — FETCH USER PROFILE
    const profileRes = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profile = await profileRes.json();

    console.log("✅ TRUECALLER USER PROFILE:");
    console.log(JSON.stringify(profile, null, 2));

    return Response.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("❌ TRUECALLER ERROR:", error);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}