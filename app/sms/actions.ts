"use server";

import { z } from "zod";
import validator from "validator";
import { error } from "console";
import { redirect } from "next/navigation";

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
