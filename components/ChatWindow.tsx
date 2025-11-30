"use client";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ messages }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 h-[70vh] overflow-y-auto shadow-sm">
      {messages.map((msg: any, idx: number) => (
        <MessageBubble key={idx} sender={msg.sender}>
          {msg.text}
        </MessageBubble>
      ))}
    </div>
  );
}
