import { useState } from 'react';
import { applyJudgeResponse } from '../../engine/applyJudgeResponse.ts';
import { useGameStore } from '../../engine/gameStore.ts';
import { submitFreeQuestion } from '../../engine/puzzleManager.ts';
import type { ChatMessage } from '../../types/index.ts';

interface FreeInputModeProps {
  visible: boolean;
  onToggle: () => void;
}

export function FreeInputMode({ visible, onToggle }: FreeInputModeProps) {
  const [text, setText] = useState('');
  const sessionId = useGameStore((s) => s.sessionId);
  const currentPuzzle = useGameStore((s) => s.currentPuzzle);
  const isLoading = useGameStore((s) => s.isLoading);
  const addMessage = useGameStore((s) => s.addMessage);
  const setLoading = useGameStore((s) => s.setLoading);

  const handleSubmit = async () => {
    const question = text.trim();
    if (!question || !currentPuzzle || isLoading) return;

    const playerMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'player',
      content: question,
      timestamp: Date.now(),
    };

    addMessage(playerMsg);
    setText('');
    setLoading(true);

    try {
      const response = await submitFreeQuestion({
        sessionId: sessionId ?? '',
        puzzleId: currentPuzzle.id,
        question,
      });
      applyJudgeResponse(response);
    } catch {
      addMessage({
        id: crypto.randomUUID(),
        role: 'host',
        content: '网络异常，请稍后再试。',
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  if (!visible) {
    return (
      <div className="flex shrink-0 justify-end px-3 py-1">
        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg px-2 py-1 text-lg text-white/50 hover:bg-white/10 hover:text-white/80"
          aria-label="打开键盘输入"
        >
          ⌨️
        </button>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2 border-t border-white/10 bg-black/60 px-3 py-2">
      <button
        type="button"
        onClick={onToggle}
        className="shrink-0 rounded-lg px-2 py-1 text-lg text-white/50 hover:bg-white/10"
        aria-label="关闭键盘输入"
      >
        ⌨️
      </button>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void handleSubmit();
        }}
        placeholder="自由提问…"
        disabled={isLoading}
        className="min-w-0 flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-indigo-400/50"
      />
      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={!text.trim() || isLoading || !currentPuzzle}
        className="shrink-0 rounded-lg bg-indigo-600/80 px-3 py-2 text-sm text-white hover:bg-indigo-500/80 disabled:opacity-40"
      >
        发送
      </button>
    </div>
  );
}
