import { Prisma } from "@prisma/client";

export type QuestionDataModel = Prisma.QuestionGetPayload<{
  include: {
    options: true;
  };
}>;

export type QuestionOptionPayloadModel = { value?: string };

export interface QuestionPayloadCreateModel {
  question?: string;
  options?: QuestionOptionPayloadModel[];
}

export type QuestionPayloadUpdateModel = QuestionPayloadCreateModel;

export type QuestionFormModel = QuestionDataModel;
