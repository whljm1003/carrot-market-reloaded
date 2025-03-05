import db from "@/lib/db";
import { Prisma } from "@prisma/client";
import React from "react";
import ChatList from "@/components/chat-list";
import getSession from "@/lib/session";

const session = await getSession();
async function getChatList() {
  const chats = await db.chatRoom.findMany({
    where: {
      users: {
        some: {
          id: session.id!,
        },
      },
    },
    select: {
      id: true,
      created_at: true,
      users: {
        select: {
          id: true,
          avatar: true,
          username: true,
        },
      },
      messages: {
        select: {
          id: true,
          created_at: true,
          payload: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return chats;
}

export type InitialChats = Prisma.PromiseReturnType<typeof getChatList>;

export default async function Chats() {
  const initialChats = await getChatList();

  return (
    <div>
      <ChatList initialChats={initialChats} userId={session.id!} />
    </div>
  );
}
