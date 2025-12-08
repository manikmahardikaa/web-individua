import { UserPayloadCreateModel } from "@/app/model/user";
import { CREATE_USER, GET_USERS } from "@/app/providers/user";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

const sanitizeUser = <T extends { password?: unknown }>(user: T) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = user || {};
  return rest;
};

const handleError = (error: unknown) => {
  if (error instanceof GeneralError) {
    return NextResponse.json(
      {
        success: false,
        message: error.error,
        error_code: error.error_code,
        details: error.details,
      },
      { status: error.code }
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: "Internal server error",
    },
    { status: 500 }
  );
};

export const GET = async () => {
  try {
    const data = await GET_USERS();

    return NextResponse.json(
      {
        success: true,
        message: "Successfully get users!",
        result: data.map((user) => sanitizeUser(user)),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const payload: UserPayloadCreateModel = await req.json();

    const data = await CREATE_USER(payload);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully created user!",
        result: sanitizeUser(data),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleError(error);
  }
};
