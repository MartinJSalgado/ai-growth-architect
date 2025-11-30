export default function MessageBubble({ sender = "ai", children }: any) {
  const isAI = sender === "ai";

  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"} mb-4`}>
      <div
        className={`
        max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-sm
        ${isAI
          ? "bg-white text-slate-700 border border-slate-200"
          : "bg-violet-600 text-white"
        }
      `}
      >
        {children}
      </div>
    </div>
  );
}
