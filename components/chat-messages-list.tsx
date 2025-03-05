"use client";
import { InitialChatMessages } from "@/app/chats/[id]/page";
import { saveMessage } from "@/app/chats/actions";
import { formatToTimeAgo } from "@/lib/utils";
import {
  ArrowLeftCircleIcon,
  ArrowUpCircleIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/solid";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

const SUPABASE_PUBLIC_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4dHdqb3Z2ZmhyZW1wYWlndG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNTE0NTYsImV4cCI6MjA1NjcyNzQ1Nn0.N2VtLl-wc9YyEZAGTQ5uEKZFjczBumvaD-wxjWYIIcc";
const SUPABASE_PUBLIC_URL = "https://yxtwjovvfhrempaigtoe.supabase.co";

type Props = {
  userId: number;
  initialMessages: InitialChatMessages;
  chatRoomId: string;
  username: string;
  avatar: string;
};

export default function ChatMessagesList({
  userId,
  initialMessages,
  chatRoomId,
  username,
  avatar,
}: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const channel = useRef<RealtimeChannel>();

  // update the message
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = event;
    setMessage(value);
  };

  // submit the message
  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const newMessage = {
      id: Date.now(),
      payload: message,
      created_at: new Date(),
      userId,
      user: {
        username,
        avatar,
      },
    };
    setMessages((preMsgs) => [...preMsgs, newMessage]);
    await saveMessage(message, chatRoomId);
    channel.current?.send({
      type: "broadcast",
      event: "message",
      payload: {
        id: Date.now(),
        payload: message,
        created_at: new Date(),
        userId,
        user: {
          username,
          avatar,
        },
      },
    });
    setMessage("");
  };

  // subscribe to the channel
  useEffect(() => {
    const client = createClient(SUPABASE_PUBLIC_URL, SUPABASE_PUBLIC_KEY);
    channel.current = client.channel(`room-${chatRoomId}`);
    channel.current
      .on("broadcast", { event: "message" }, (payload) => {
        setMessages((preMsgs) => [...preMsgs, payload.payload]);
      })
      .subscribe();

    return () => {
      channel.current?.unsubscribe();
    };
  }, [chatRoomId]);

  return (
    <div className="p-5 flex flex-col gap-5 min-h-screen justify-end">
      <Link href={"/chat"} className="text-white">
        <ArrowUturnLeftIcon className="z-50 absolute top-5 left-5 size-7" />
      </Link>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-2 items-start ${
            message.userId === userId ? "justify-end" : ""
          }`}
        >
          {message.userId === userId ? null : (
            <Image
              src={message.user.avatar!}
              alt={message.user.username}
              width={50}
              height={50}
              className="size-8 rounded-full"
            />
          )}
          <div
            className={`flex flex-col gap-1 ${
              message.userId === userId ? "items-end" : ""
            }`}
          >
            <span
              className={`${
                message.userId === userId ? "bg-neutral-500" : "bg-orange-500"
              } p-2.5 rounded-md`}
            >
              {message.payload}
            </span>
            <span className="text-xs">
              {formatToTimeAgo(message.created_at.toString())}
            </span>
          </div>
        </div>
      ))}
      <form className="flex relative" onSubmit={onSubmit}>
        <input
          required
          onChange={onChange}
          value={message}
          className="bg-transparent rounded-full w-full h-10 focus:outline-none px-5 ring-2 focus:ring-4 transition ring-neutral-200 focus:ring-neutral-50 border-none placeholder:text-neutral-400"
          type="text"
          name="message"
          placeholder="Write a message..."
        />
        <button className="absolute right-0">
          <ArrowUpCircleIcon className="size-10 text-orange-500 transition-colors hover:text-orange-300" />
        </button>
      </form>
    </div>
  );
}
