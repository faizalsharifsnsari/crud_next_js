export const runtime = "nodejs";

let verifiedUsers = {}; // simple in-memory store (for now)

export async function POST(request) {
  try {
    const body = await request.json();

    const { accessToken, endpoint, requestId } = body;

    if (!accessToken || !endpoint || !requestId) {
      return Response.json(
        { error: "Invalid Truecaller response" },
        { status: 400 }
      );
    }

    const profileRes = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profile = await profileRes.json();

    // ✅ Store using requestId
    verifiedUsers[requestId] = profile;

    return Response.json({ success: true });

  } catch (error) {
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}

// 👇 ADD THIS
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get("requestId");

  const profile = verifiedUsers[requestId];

  if (!profile) {
    return Response.json({ verified: false });
  }

  // delete after use
  delete verifiedUsers[requestId];

  return Response.json({
    verified: true,
    profile,
  });
}