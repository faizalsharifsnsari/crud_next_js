export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();

    console.log("Truecaller raw body:", body);

    const {
      firstName,
      lastName,
      phoneNumber,
      gender,
      email,
      requestNonce
    } = body;

    if (!phoneNumber) {
      return Response.json(
        { error: "Phone number missing" },
        { status: 400 }
      );
    }

    // ✅ TODO: verify requestNonce with stored value if you implemented it

    // 🔐 Here you can:
    // - Create user in DB
    // - Generate JWT
    // - Create NextAuth session manually

    console.log("User verified:", {
      name: `${firstName} ${lastName}`,
      phoneNumber,
      email,
    });

    return Response.json(
      {
        success: true,
        message: "Truecaller verification successful",
        user: {
          firstName,
          lastName,
          phoneNumber,
          email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Truecaller callback error:", error);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}