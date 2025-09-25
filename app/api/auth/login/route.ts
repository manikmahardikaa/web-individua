import { UserPayloadLoginModel } from "@/app/model/user";
import { LOGIN_USER } from "@/app/providers/user";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const payload: UserPayloadLoginModel = await req.json();
    const { email, password } = payload;

    const data = await LOGIN_USER(email, password);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully logged!",
        result: data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to log in",
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
};
