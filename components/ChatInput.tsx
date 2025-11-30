"use client";

export default function ChatInput({ value, setValue, onSubmit }: any) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center gap-3 mt-4 bg-white border border-slate-300 rounded-2xl px-4 py-3 shadow-sm"
    >
      <input
        className="flex-1 focus:outline-none text-sm text-slate-700"
        placeholder="Ask me anything about your GTM strategy..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <button className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm">
        Send
      </button>
    </form>
  );
}
