"use server";

import { z } from "zod";
import validator from "validator";
import { redirect } from "next/navigation";
import crypto from "crypto";
import db from "@/lib/db";

const phoneSchema = z
  .string()
  .trim()
  .refine(
    (phone) => validator.isMobilePhone(phone, "ko-KR"),
    "Wrong phone format"
  );

const tokenSchema = z.coerce.number().min(100000).max(999999);

interface ActionState {
  token: boolean;
}

async function getToken() {
  const token = crypto.randomInt(100000, 999999).toString();
  const exists = await db.sMSToken.findUnique({
    where: {
      token,
    },
    select: {
      id: true,
    },
  });

  if (exists) {
    return getToken();
  } else {
    return token;
  }
}

export async function smsLogIn(prevState: ActionState, formData: FormData) {
  const phone = formData.get("phone");
  const token = formData.get("token");

  // 최초 (휴대폰 인증)
  if (!prevState.token) {
    const result = phoneSchema.safeParse(phone);

    // 휴대폰 인증 검사 실패
    if (!result.success) {
      return {
        token: false,
        error: result.error.flatten(),
      };
      // 휴대폰 인증 성공
    } else {
      await db.sMSToken.deleteMany({
        where: {
          user: {
            phone: result.data,
          },
        },
      });
      const token = await getToken();
      await db.sMSToken.create({
        data: {
          token,
          user: {
            connectOrCreate: {
              where: {
                phone: result.data,
              },
              create: {
                username: crypto.randomBytes(10).toString("hex"),
                phone: result.data,
              },
            },
          },
        },
      });
      // send the token using twilio
      return {
        token: true,
      };
    }
    // 최초가 아닐 경우 (토큰 인증)
  } else {
    const result = tokenSchema.safeParse(token);
    // 토큰 인증 실패
    if (!result.success) {
      return {
        token: true,
        error: result.error.flatten(),
      };
      // 토큰 인증 성공
    } else {
      redirect("/");
    }
  }
}
