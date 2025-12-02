import { ContentIdeaCard, type ContentIdea } from './ContentIdeaCard';

interface Message {
  sender: string;
  text: string;
}

interface MessageBubbleProps {
  message?: Message;
  sender?: string;
  children?: React.ReactNode;
}

function parseContentIdeas(text: string): { ideas: ContentIdea[]; cleanText: string } {
  const regex = /\[CONTENT_IDEA\](.*?)\[\/CONTENT_IDEA\]/gs;
  const ideas: ContentIdea[] = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    try {
      const ideaJson = match[1].trim();
      const idea = JSON.parse(ideaJson);
      ideas.push(idea);
    } catch (e) {
      console.error('Failed to parse content idea:', e);
      console.error('JSON:', match[1]);
    }
  }

  // Remove the JSON blocks from display text
  const cleanText = text.replace(regex, '').trim();

  return { ideas, cleanText };
}

export default function MessageBubble({ message, sender, children }: MessageBubbleProps) {
  // Support both old API (sender + children) and new API (message object)
  const actualSender = message?.sender || sender || 'ai';
  const messageText = message?.text || (typeof children === 'string' ? children : '');

  const isAI = actualSender === 'ai';

  // User messages - simple display
  if (!isAI) {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-blue-600 text-white rounded-2xl px-4 py-3 max-w-lg shadow-sm">
          {messageText || children}
        </div>
      </div>
    );
  }

  // AI messages - parse for content ideas
  const { ideas, cleanText } = parseContentIdeas(messageText);

  return (
    <div className="flex justify-start mb-6">
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 max-w-3xl shadow-sm">
        {/* Clean message text */}
        {cleanText && (
          <div className="text-slate-800 mb-4 whitespace-pre-wrap leading-relaxed">
            {cleanText}
          </div>
        )}

        {/* Fallback for old children-based content */}
        {!cleanText && !messageText && children && (
          <div className="text-slate-800 whitespace-pre-wrap leading-relaxed">
            {children}
          </div>
        )}

        {/* Content idea cards */}
        {ideas.length > 0 && (
          <div className="space-y-3 mt-4">
            {ideas.map((idea, index) => (
              <ContentIdeaCard key={index} idea={idea} index={index + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
