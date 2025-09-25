
import { NextRequest, NextResponse } from "next/server";
import { UserPayloadCreateModel } from "../model/user";
import { CREATE_USER } from "../providers/user";

export const POST = async (req: NextRequest) => {
  try {
    const payload: UserPayloadCreateModel = await req.json();

    const data = await CREATE_USER(payload);

    return NextResponse.json(
      {
        error: false,
        message: "Successfully registered!",
        result: data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to register user",
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
};
