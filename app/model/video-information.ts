/* eslint-disable @typescript-eslint/no-empty-object-type */

import { Prisma, VideoInformation } from "@prisma/client";
import { GeneralOmitModel } from "./general-omit";

export interface VideoInformationDataModel extends VideoInformation {}

export interface VideoInformationPayloadCreateModel
  extends Prisma.VideoInformationUncheckedCreateInput {}


export interface VideoInformationPayloadUpdateModel
  extends Omit<Prisma.VideoInformationUncheckedUpdateInput, GeneralOmitModel> {}

export interface VideoInformationFormModel
  extends Omit<VideoInformationDataModel, GeneralOmitModel> {}
