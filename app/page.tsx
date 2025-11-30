"use client";

import { useState } from "react";
import ChatWindow from "@/components/ChatWindow";
import ChatInput from "@/components/ChatInput";
import QuickActions from "@/components/QuickActions";
import AIInsights from "@/components/AIInsights";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text:
        "Hi! I'm your AI Growth Architect. I've analyzed your GTM data and identified 3 key opportunities to accelerate growth. What would you like to focus on today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Call your backend API
      const res = await fetch("/api/growth-architect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyDescription: input,
          goal: "General Chat",
          metrics: "",
        }),
      });

      const data = await res.json();

      const aiMessage = { sender: "ai", text: data.answer || data.error || "No response" };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = { sender: "ai", text: "Error: Failed to connect to the API" };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-semibold text-slate-800 mb-2">
        AI Growth Architect
      </h1>
      <p className="text-slate-500 mb-8">
        Get intelligent recommendations and strategic guidance for your GTM initiatives.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2">
          <ChatWindow messages={messages} />
          <ChatInput value={input} setValue={setInput} onSubmit={handleSubmit} />
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <QuickActions />
          <AIInsights />
        </div>
      </div>
    </main>
  );
}
