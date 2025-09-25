import db from "@/lib/prisma";
import {
  QuestionPayloadCreateModel,
  QuestionPayloadUpdateModel,
} from "../model/question";

/** Util sanitasi sesuai schema */
const MAX_QUESTION = 255;
const MAX_VALUE = 100;

function sanitizeQuestion(q: string | undefined) {
  return String(q ?? "")
    .trim()
    .slice(0, MAX_QUESTION);
}

function sanitizeOptions(options?: Array<{ value?: string }>) {
  const cleaned =
    (options ?? [])
      .map((o) => ({
        value: String(o?.value ?? "")
          .trim()
          .slice(0, MAX_VALUE),
      }))
      .filter((o) => !!o.value) ?? [];

  // pastikan unik secara sederhana di server
  const set = new Set(cleaned.map((o) => o.value));
  if (set.size !== cleaned.length) {
    throw new Error("Value opsi harus unik dan tidak boleh kosong.");
  }
  return cleaned;
}

export const GET_QUESTIONS = async () => {
  const result = await db.question.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      options: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
  return result;
};

export const CREATE_QUESTION = async (payload: QuestionPayloadCreateModel) => {
  const question = sanitizeQuestion(payload?.question);
  if (!question) throw new Error("Pertanyaan wajib diisi.");

  const options = sanitizeOptions(payload?.options);

  const result = await db.question.create({
    data: {
      question,
      options: {
        // penting: nested write, bukan array mentah
        create: options.map((o) => ({ value: o.value })),
        // alternatif: createMany: { data: options }
      },
    },
    include: { options: true },
  });
  return result;
};

export const GET_QUESTION = async (id: string) => {
  const result = await db.question.findUnique({
    where: { id },
    include: {
      options: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
  return result;
};

export const DELETE_QUESTION = async (id: string) => {
  // relasi QuestionOption → Question sudah onDelete: Cascade, jadi aman
  const result = await db.question.delete({
    where: { id },
  });
  return result;
};

export const UPDATE_QUESTION = async (
  id: string,
  payload: QuestionPayloadUpdateModel
) => {
  const question = sanitizeQuestion(payload?.question);
  if (!question) throw new Error("Pertanyaan wajib diisi.");

  const options = sanitizeOptions(payload?.options);

  // strategi replace-all opsi: hapus semua lalu create ulang
  const result = await db.$transaction(async (tx) => {
    await tx.question.update({
      where: { id },
      data: {
        question,
        // hapus semua opsi lama
        options: { deleteMany: {} },
      },
    });

    if (options.length) {
      await tx.questionOption.createMany({
        data: options.map((o) => ({
          questionId: id,
          value: o.value,
        })),
      });
    }

    // ambil ulang lengkap
    const updated = await tx.question.findUnique({
      where: { id },
      include: { options: { orderBy: { createdAt: "asc" } } },
    });

    return updated!;
  });

  return result;
};
