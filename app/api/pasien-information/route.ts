import { PasienInformationPayloadCreateModel } from "@/app/model/pasien-information";
import { CREATE_PASIEN_INFORMATION } from "@/app/providers/pasien-information";
import { GeneralError } from "@/app/utils/general-error";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const payload: PasienInformationPayloadCreateModel = await req.json();

    const data = await CREATE_PASIEN_INFORMATION(payload);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully created data!",
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
