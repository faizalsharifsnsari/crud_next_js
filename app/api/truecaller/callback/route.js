export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();

    console.log("Truecaller initial body:", body);

    const { accessToken, endpoint } = body;

    if (!accessToken || !endpoint) {
      return Response.json(
        { error: "Invalid Truecaller response" },
        { status: 400 }
      );
    }

    // 🔥 Fetch actual user profile
    const profileRes = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profile = await profileRes.json();

    console.log("Truecaller profile:", profile);

    return Response.json(
      { success: true, profile },
      { status: 200 }
    );

  } catch (error) {
    console.error("Callback error:", error);
    return Response.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}