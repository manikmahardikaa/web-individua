import db from "@/lib/prisma";
import { NewsPayloadCreateModel, NewsPayloadUpdateModel } from "../model/news";

const MAX_TITLE = 200;
const MAX_DESC = 5000;

/* -------- Sanitizers -------- */
function sanitizeTitle(title: string | undefined) {
  return String(title ?? "")
    .trim()
    .slice(0, MAX_TITLE);
}

function sanitizeThumbnail(thumbnail: string | null | undefined) {
  const value = String(thumbnail ?? "").trim();
  if (!value) return "";
  return value;
}

function sanitizeStatus(isActive: boolean | undefined) {
  return Boolean(isActive);
}

function sanitizeDescription(description: string | null | undefined) {
  // Wajib diisi; jika ingin opsional ubah validasinya di bawah
  const v = String(description ?? "")
    .trim()
    .slice(0, MAX_DESC);
  return v;
}

/* -------- Queries -------- */
export const GET_NEWS_BY_ID = async (id: string) => {
  const result = await db.news.findUnique({ where: { id } });
  return result;
};

export const GET_NEWS = async () => {
  const result = await db.news.findMany({
    orderBy: { createdAt: "desc" },
  });
  return result;
};

export const DELETE_NEWS = async (id: string) => {
  const result = await db.news.delete({ where: { id } });
  return result;
};

/* -------- Mutations -------- */
export const CREATE_NEWS = async (payload: NewsPayloadCreateModel) => {
  const title = sanitizeTitle(payload?.title);
  if (!title) throw new Error("Judul wajib diisi.");

  const thumbnail = sanitizeThumbnail(payload?.thumbnail);
  if (!thumbnail) throw new Error("Thumbnail wajib diunggah.");

  const description = sanitizeDescription(payload?.description);
  if (!description) throw new Error("Deskripsi wajib diisi.");

  const is_active = sanitizeStatus(payload?.is_active);

  const result = await db.news.create({
    data: {
      title,
      thumbnail,
      is_active,
      description, // simpan
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

  // Jika description ikut diupdate, validasi & simpan
  const description = sanitizeDescription(payload?.description);

  const result = await db.news.update({
    where: { id },
    data: {
      title,
      thumbnail,
      is_active,
      ...(payload.description !== undefined ? { description } : {}),
    },
  });
  return result;
};
