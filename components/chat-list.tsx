"use client";

import { InitialChats } from "@/app/(tabs)/chat/page";
import Image from "next/image";
import { formatToTimeAgo } from "@/lib/utils";
import Link from "next/link";

interface ChatListProps {
  initialChats: InitialChats;
  userId: number;
}

export default function ChatList({ initialChats, userId }: ChatListProps) {
  return (
    <div className="p-5 flex flex-col gap-5">
      {initialChats.map((chat) => (
        <Link
          key={chat.id}
          href={`/chats/${chat.id}`}
          className="text-neutral-500 flex gap-5 "
        >
          <Image
            className="size-16 bg-neutral-700 rounded-full"
            src={chat.users.find((user) => user.id !== userId)?.avatar!}
            alt={chat.users.find((user) => user.id !== userId)?.username!}
            width={64}
            height={64}
          />
          <div className="flex flex-col justify-center gap-2 *:rounded-md">
            <div className="flex gap-4 w-40 *:rounded-md">
              <div className="h-5">
                <span className="text-slate-200">
                  {chat.users.find((user) => user.id !== userId)?.username}
                </span>
              </div>
              <div className="h-5">
                {formatToTimeAgo(chat.created_at.toString())}
              </div>
            </div>
            <div className="h-5 w-40">
              <p>{chat.messages[0]?.payload}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
