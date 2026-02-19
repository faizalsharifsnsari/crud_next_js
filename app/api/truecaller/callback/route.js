export async function POST(request) {
  try {
    const body = await request.json();

    console.log("---- TRUECALLER CALLBACK RECEIVED ----");
    console.log("Incoming Body:", body);

    // 1️⃣ Handshake
    if (body.status === "flow_invoked") {
      console.log("Flow invoked successfully:", body.requestId);
      return Response.json({ received: true }, { status: 200 });
    }

    // 2️⃣ User rejected
    if (body.status === "user_rejected") {
      console.log("User rejected login:", body.requestId);
      return Response.json({ error: "User rejected" }, { status: 200 });
    }

    // 3️⃣ User approved
    if (body.accessToken && body.endpoint) {
      console.log("Access token received");

      const profileResponse = await fetch(body.endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${body.accessToken}`,
          "Cache-Control": "no-cache",
        },
      });

      if (!profileResponse.ok) {
        console.error("Profile fetch failed");
        return Response.json(
          { error: "Failed to fetch profile" },
          { status: 401 }
        );
      }

      const userProfile = await profileResponse.json();

      console.log("---- TRUECALLER USER PROFILE ----");
      console.log(userProfile);

      return Response.json({ success: true }, { status: 200 });
    }

    console.log("Invalid callback payload");
    return Response.json({ error: "Invalid request" }, { status: 400 });

  } catch (error) {
    console.error("Truecaller Callback Error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
