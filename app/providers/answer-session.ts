import db from "@/lib/prisma";
import { AnswerSessionPayloadCreateModel } from "../model/answer-session";

export const GET_ANSWER_SESSIONS = async (user_id: string) => {
  const result = await db.answerSession.findMany({
    where: { user_id: user_id },
    include: {
      answers: { include: { question: true, selectedOption: true } },
      pasien: true,
    },
    orderBy: { startedAt: "desc" },
  });
  return result;
};

export const CREATE_ANSWER_SESSION = async (payload: AnswerSessionPayloadCreateModel) => {
  const result = await db.answerSession.create({
    data: payload,
  });
  return result;
};
