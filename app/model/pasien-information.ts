/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma, PasienInformation } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export interface PasienInformationDataModel extends PasienInformation {}

export interface PasienInformationPayloadCreateModel
  extends Prisma.PasienInformationUncheckedCreateInput {}

export interface PasienInformationPayloadLoginModel
  extends Omit<Prisma.PasienInformationUncheckedCreateInput, "password"> {
}
export interface PasienInformationPayloadUpdateModel
  extends Omit<Prisma.PasienInformationUncheckedUpdateInput, GeneralOmitModel> {}

export interface PasienInformationFormModel extends Omit<PasienInformationDataModel, GeneralOmitModel> {}
