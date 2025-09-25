import db from "@/lib/prisma";
import { VideoInformationPayloadCreateModel, VideoInformationPayloadUpdateModel } from "../model/video-information";

export const GET_INFORMATION = async (id: string) => {
  const result = await db.videoInformation.findUnique({
    where: { id },
  });
  return result;
};

export const GET_INFORMATIONS = async () => {
  const result = await db.videoInformation.findMany({});
  return result;
};

export const DELETE_INFORMATION = async (id: string) => {
  const result = await db.videoInformation.delete({
    where: { id },
  });
  return result;
};

export const CREATE_INFORMATION = async (payload: VideoInformationPayloadCreateModel) => {
  const result = await db.videoInformation.create({
    data: payload,
  });
  return result;
};

export const UPDATE_INFORMATION = async (
  id: string,
  payload: VideoInformationPayloadUpdateModel
) => {
  const result = await db.news.update({
    where: { id },
    data: payload,
  });
  return result;
};
