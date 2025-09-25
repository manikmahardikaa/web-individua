import db from "@/lib/prisma";
import { UserPayloadCreateModel, UserPayloadUpdateModel } from "../model/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const GET_USERS = async () => {
  const result = await db.user.findMany({});
  return result;
};

export const GET_USER = async (id: string) => {
  const result = await db.user.findUnique({
    where: { id },
  });
  return result;
};

export const LOGIN_USER = async (email: string, password: string) => {
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  const token = jwt.sign(
    {
      user_id: user.id,
      name: user.name,
      role: user.role, // jika kamu ingin menambahkan role
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  return {
    token,
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role, 
  };
};

export const CREATE_USER = async (payload: UserPayloadCreateModel) => {
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const result = await db.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
  });

  return result;
};

export const UPDATE_USER = async (
  id: string,
  payload: UserPayloadUpdateModel
) => {
  const result = await db.user.update({
    where: { id },
    data: payload,
  });
  return result;
};

export const DELETE_USER = async (id: string) => {
  const result = await db.user.delete({
    where: { id },
  });
  return result;
};
