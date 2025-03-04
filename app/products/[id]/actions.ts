"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";

export async function createChatRoom(prevState: any, formData: FormData) {
  const productUserId = Number(formData.get("productUserId"));
  const session = await getSession();
  // console.log("productUserId->", productUserId);
  // console.log("session->", session);
  if (!session.id) {
    return { error: "Unauthorized" };
  }
  const room = await db.chatRoom.create({
    data: {
      users: {
        connect: [
          {
            id: productUserId,
          },
          {
            id: session.id,
          },
        ],
      },
    },
    select: {
      id: true,
    },
  });
  redirect(`/chats/${room.id}`);
  return null;
}
