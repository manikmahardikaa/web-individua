import { AnswerSessionPayloadCreateModel } from "@/app/model/answer-session";
import { CREATE_ANSWER_SESSION, GET_ANSWER_SESSIONS } from "@/app/providers/answer-session";
import { GeneralError } from "@/app/utils/general-error";
import { evaluateAndSaveSession } from "@/app/utils/screening-evaluator";
import { NextRequest, NextResponse } from "next/server";

function handleError(error: unknown) {
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

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("userId") as string;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing id parameter",
        },
        { status: 400 }
      );
    }

    const data = await GET_ANSWER_SESSIONS(id);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully get data!",
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


export async function POST(req: NextRequest) {
  try {
    const payload: AnswerSessionPayloadCreateModel = await req.json();

    // 1) Buat sesi + nested answers di DB
    const created = await CREATE_ANSWER_SESSION(payload);

    // 2) Jalankan evaluator Gemini → isi percentage & summary (+ submittedAt)
    //    Jika ingin non-blocking, Anda bisa tidak pakai await.
    const evaluated = await evaluateAndSaveSession({ sessionId: created.id });

    return NextResponse.json(
      {
        success: true,
        message: "Successfully created & evaluated!",
        result: evaluated, // sudah ada percentage & summary
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
