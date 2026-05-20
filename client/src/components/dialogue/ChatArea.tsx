import { useEffect, useRef } from 'react';
import { useGameStore } from '../../engine/gameStore.ts';
import type { AnswerType } from '../../types/index.ts';

function answerIcon(type?: AnswerType): string {
  if (type === 'yes') return '✅';
  if (type === 'no') return '❌';
  if (type === 'irrelevant') return '🤷';
  return '';
}

function hostBubbleClass(answerType?: AnswerType): string {
  const base = 'max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed';
  if (answerType === 'yes') {
    return `${base} border-l-4 border-amber-400 bg-gradient-to-br from-zinc-800/95 to-zinc-800/80 text-white/90`;
  }
  if (answerType === 'no') {
    return `${base} border-l-4 border-red-700/80 bg-gradient-to-br from-zinc-800/95 to-zinc-800/80 text-white/85`;
  }
  if (answerType === 'irrelevant') {
    return `${base} border-l-4 border-zinc-600/50 bg-zinc-800/40 text-white/45`;
  }
  return `${base} bg-zinc-800/90 text-white/85`;
}

export function ChatArea() {
  const messages = useGameStore((s) => s.messages);
  const isLoading = useGameStore((s) => s.isLoading);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pt-2">
      <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain py-2 scrollbar-none">
        {messages.length === 0 && !isLoading && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-white/20 italic">选择卡牌开始提问...</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isNew = idx >= messages.length - 2;
          return (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'player' ? 'justify-end' : 'justify-start'} ${
                isNew ? (msg.role === 'player' ? 'bubble-in-right' : 'bubble-in-left') : ''
              }`}
            >
              <div
                className={
                  msg.role === 'player'
                    ? 'max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-blue-900/80 to-indigo-900/70 px-4 py-3 text-sm leading-relaxed text-white/90 shadow-md shadow-blue-900/20'
                    : hostBubbleClass(msg.answerType)
                }
              >
                {msg.role === 'host' && msg.answerType && (
                  <span className="mr-1.5 text-xs">{answerIcon(msg.answerType)}</span>
                )}
                {msg.content}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start bubble-in-left">
            <div className="flex items-center gap-1.5 rounded-2xl bg-zinc-800/80 px-5 py-3.5 shadow-md">
              <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400/70 [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400/70 [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400/70 [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
