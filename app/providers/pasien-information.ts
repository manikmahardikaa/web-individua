import db from "@/lib/prisma";
import { PasienInformationPayloadCreateModel } from "../model/pasien-information";

export const CREATE_PASIEN_INFORMATION = async (payload: PasienInformationPayloadCreateModel) => {
  const result = await db.pasienInformation.create({
    data: payload,
  });
  return result;
};