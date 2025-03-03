"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidateTag } from "next/cache";

// 좋아요
export async function likePost(postId: number) {
  "use server";
  // await new Promise((resolve) => setTimeout(resolve, 5000));
  const session = await getSession();
  try {
    await db.like.create({
      data: {
        postId,
        userId: session?.id!,
      },
    });
    revalidateTag(`like-status-${postId}`);
  } catch (error) {}
}

// 좋아요 취소
export async function dislikePost(postId: number) {
  "use server";
  try {
    const session = await getSession();
    await db.like.delete({
      where: {
        id: {
          postId,
          userId: session?.id!,
        },
      },
    });
    revalidateTag(`like-status-${postId}`);
  } catch (error) {}
}
