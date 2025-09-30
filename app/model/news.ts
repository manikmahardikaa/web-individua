import { News } from "@prisma/client";

export type NewsDataModel = News;

export interface NewsPayloadCreateModel {
  title?: string;
  thumbnail?: string | null;
  is_active?: boolean;
  description?: string | null;
}

export type NewsPayloadUpdateModel = NewsPayloadCreateModel;

export type NewsFormModel = NewsDataModel;
