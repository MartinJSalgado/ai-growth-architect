export default function AIInsights() {
  const insights = [
    {
      title: "Untapped Market Segment",
      level: "High",
      description:
        "Your data shows 34% higher engagement from the enterprise segment. Consider creating dedicated campaigns.",
      button: "Create Strategy",
    },
    {
      title: "Email Send Time Optimization",
      level: "Medium",
      description:
        "Emails sent at 10 AM on Tuesdays show 2.3x better open rates than your current schedule.",
      button: "Apply Changes",
    },
    {
      title: "Content Gap Analysis",
      level: "High",
      description:
        "Your competitors are publishing case studies. This content type could improve conversions by 18%.",
      button: "Generate Ideas",
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-700 mb-4">AI Insights</h2>

      <div className="space-y-4">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-800">{insight.title}</span>
              <span className="text-xs px-2 py-1 bg-violet-100 text-violet-700 rounded-full">
                {insight.level}
              </span>
            </div>

            <p className="text-sm text-slate-600 mb-3">{insight.description}</p>

            <button className="px-4 py-2 bg-violet-100 text-violet-700 text-sm rounded-lg hover:bg-violet-200 transition">
              {insight.button}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
