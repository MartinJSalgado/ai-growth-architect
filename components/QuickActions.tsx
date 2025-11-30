interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

export default function QuickActions({ onActionClick }: QuickActionsProps) {
  const items = [
    { label: "Generate Campaign Plan", icon: "🎯" },
    { label: "Get Growth Ideas", icon: "💡" },
    { label: "Content Suggestions", icon: "📄" },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-slate-700">Quick Actions</h2>

      <div className="space-y-3">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => onActionClick(item.label)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 border border-violet-200 bg-violet-50 hover:bg-violet-100 transition"
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
