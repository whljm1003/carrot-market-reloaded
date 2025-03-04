"use client";
import { createChatRoom } from "@/app/products/[id]/actions";
import React from "react";
import { useActionState } from "react";

type Props = {
  productUserId: number;
};

export default function ChatForm({ productUserId }: Props) {
  const [state, chatDispatch] = useActionState(createChatRoom, null);
  return (
    <form action={chatDispatch}>
      <input type="hidden" name="productUserId" value={productUserId} />
      <button className="bg-orange-500 px-5 py-2.5 rounded-md text-white font-semibold">
        채팅하기
      </button>
    </form>
  );
}
