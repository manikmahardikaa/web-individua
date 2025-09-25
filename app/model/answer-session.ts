// answer-session.model.ts
import { Prisma } from "@prisma/client";

/**
 * Hasil pembacaan (read) AnswerSession beserta relasinya:
 * - pasien
 * - answers + question
 */
export type AnswerSessionDataModel = Prisma.AnswerSessionGetPayload<{
  include: {
    pasien: true;
    answers: { include: { question: true } };
  };
}>;

/**
 * Payload create yang valid untuk AnswerSession.
 *
 * Catatan:
 * - `id` auto-generate → tidak diperlukan dari client
 * - `startedAt` opsional (ada default now() di schema)
 * - Bisa menyertakan nested create untuk answers (opsional)
 */
export type AnswerSessionPayloadCreateModel = Pick<
  Prisma.AnswerSessionUncheckedCreateInput,
  | "pasienId"
  | "user_id"
  | "startedAt"
  | "submittedAt"
  | "summary"
  | "percentage"
> & {
  // kalau ingin langsung sekalian create jawaban di sesi ini
  answers?: Prisma.AnswerUncheckedCreateNestedManyWithoutSessionInput;
};

/**
 * Payload update untuk AnswerSession.
 * Biasanya yang diubah: submittedAt, summary, percentage.
 * (id tidak diubah; gunakan WhereUnique saat pemanggilan repository/service)
 */
export type AnswerSessionPayloadUpdateModel = Pick<
  Prisma.AnswerSessionUncheckedUpdateInput,
  "submittedAt" | "summary" | "percentage"
>;

/**
 * WhereUnique helper (mis. untuk update/find/delete)
 */
export type AnswerSessionWhereUnique = Prisma.AnswerSessionWhereUniqueInput;

/**
 * Bentuk “form model” di layer UI sama dengan data model yang sudah di-include.
 */
export type AnswerSessionFormModel = AnswerSessionDataModel;
