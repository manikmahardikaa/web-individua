import { NewsPayloadUpdateModel } from "@/app/model/news";
import { DELETE_NEWS, GET_NEWS_BY_ID, UPDATE_NEWS } from "@/app/providers/news";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;

    const data = await GET_NEWS_BY_ID(id);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully get job!",
        result: data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
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
  }
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;
    const payload: NewsPayloadUpdateModel = await req.json();

    const data = await UPDATE_NEWS(id, payload);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully updated!",
        result: data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
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
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;

    const data = await DELETE_NEWS(id);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully deleted!",
        result: data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
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
  }
};