import { UserPayloadUpdateModel } from "@/app/model/user";
import { DELETE_USER, GET_USER, UPDATE_USER } from "@/app/providers/user";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

const sanitizeUser = <T extends { password?: unknown }>(user: T | null) => {
  if (!user) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = user;
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

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const { id } = params;

    const data = await GET_USER(id);

    if (!data) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Successfully retrieved user",
        result: sanitizeUser(data),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const { id } = params;
    const payload: UserPayloadUpdateModel = await req.json();

    const data = await UPDATE_USER(id, payload);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully updated user",
        result: sanitizeUser(data),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const { id } = params;

    const data = await DELETE_USER(id);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully deleted user",
        result: sanitizeUser(data),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleError(error);
  }
};
