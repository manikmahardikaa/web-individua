import db from "@/lib/prisma";
import { NewsPayloadCreateModel, NewsPayloadUpdateModel } from "../model/news";

const MAX_TITLE = 200;

function sanitizeTitle(title: string | undefined) {
  return String(title ?? "").trim().slice(0, MAX_TITLE);
}

function sanitizeThumbnail(thumbnail: string | null | undefined) {
  const value = String(thumbnail ?? "").trim();
  if (!value) return "";
  return value;
}

function sanitizeStatus(isActive: boolean | undefined) {
  return Boolean(isActive);
}

export const GET_NEWS_BY_ID = async (id: string) => {
  const result = await db.news.findUnique({
    where: { id },
  });
  return result;
};

export const GET_NEWS = async () => {
  const result = await db.news.findMany({});
  return result;
};

export const DELETE_NEWS = async (id: string) => {
  const result = await db.news.delete({
    where: { id },
  });
  return result;
};

export const CREATE_NEWS = async (payload: NewsPayloadCreateModel) => {
  const title = sanitizeTitle(payload?.title);
  if (!title) throw new Error("Judul wajib diisi.");

  const thumbnail = sanitizeThumbnail(payload?.thumbnail);
  if (!thumbnail) throw new Error("Thumbnail wajib diunggah.");

  const is_active = sanitizeStatus(payload?.is_active);

  const result = await db.news.create({
    data: {
      title,
      thumbnail,
      is_active,
    },
  });
  return result;
};

export const UPDATE_NEWS = async (
  id: string,
  payload: NewsPayloadUpdateModel
) => {
  const title = sanitizeTitle(payload?.title);
  if (!title) throw new Error("Judul wajib diisi.");

  const thumbnail = sanitizeThumbnail(payload?.thumbnail);
  if (!thumbnail) throw new Error("Thumbnail wajib diunggah.");

  const is_active = sanitizeStatus(payload?.is_active);

  const result = await db.news.update({
    where: { id },
    data: {
      title,
      thumbnail,
      is_active,
    },
  });
  return result;
};
