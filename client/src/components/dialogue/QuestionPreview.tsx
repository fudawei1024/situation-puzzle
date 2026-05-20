import { useState } from 'react';
import { applyJudgeResponse } from '../../engine/applyJudgeResponse.ts';
import { useGameStore } from '../../engine/gameStore.ts';
import { submitQuestion } from '../../engine/puzzleManager.ts';
import type { ChatMessage } from '../../types/index.ts';

export function QuestionPreview() {
  const currentQuestion = useGameStore((s) => s.currentQuestion);
  const questionAlternatives = useGameStore((s) => s.questionAlternatives);
  const questionIndex = useGameStore((s) => s.questionIndex);
  const selectedElement = useGameStore((s) => s.selectedElement);
  const selectedAction = useGameStore((s) => s.selectedAction);
  const sessionId = useGameStore((s) => s.sessionId);
  const currentPuzzle = useGameStore((s) => s.currentPuzzle);
  const isLoading = useGameStore((s) => s.isLoading);

  const clearSelection = useGameStore((s) => s.clearSelection);
  const clearQuestion = useGameStore((s) => s.clearQuestion);
  const cycleQuestion = useGameStore((s) => s.cycleQuestion);
  const addMessage = useGameStore((s) => s.addMessage);
  const setLoading = useGameStore((s) => s.setLoading);

  const [flash, setFlash] = useState(false);

  const disabled = !currentQuestion || isLoading || !currentPuzzle || !selectedElement;

  const handleCancel = () => {
    clearSelection();
    clearQuestion();
  };

  const handleCycle = () => {
    cycleQuestion();
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
  };

  const handleSend = async () => {
    if (!currentQuestion || !currentPuzzle || !selectedElement) return;

    const cardCombo: [string, string?] = [
      selectedElement.id,
      selectedAction?.id,
    ];

    const playerMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'player',
      content: currentQuestion,
      cardCombo,
      timestamp: Date.now(),
    };

    addMessage(playerMsg);
    setLoading(true);

    try {
      const response = await submitQuestion({
        sessionId: sessionId ?? '',
        puzzleId: currentPuzzle.id,
        cardCombo,
        question: currentQuestion,
      });
      applyJudgeResponse(response);
      clearSelection();
      clearQuestion();
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

  return (
    <div
      className={`flex shrink-0 items-center gap-2 border-t border-white/10 px-2 transition-all duration-300 ${
        currentQuestion
          ? 'h-12 bg-gradient-to-r from-indigo-950/50 to-violet-950/30'
          : 'h-10 bg-black/40'
      } ${flash ? 'question-flash' : ''}`}
    >
      <button
        type="button"
        onClick={handleCancel}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white active:scale-90"
        aria-label="取消"
      >
        ✕
      </button>

      <button
        type="button"
        onClick={handleCycle}
        disabled={!currentQuestion || questionAlternatives.length <= 1}
        className="flex min-w-0 flex-1 flex-col items-center justify-center disabled:opacity-50"
      >
        <span
          className={`w-full truncate text-center text-sm transition-all duration-300 ${
            currentQuestion ? 'text-white/90 font-medium' : 'text-white/35 italic'
          }`}
        >
          {currentQuestion ?? '选择卡牌组合以生成问题'}
        </span>
        {questionAlternatives.length > 1 && (
          <div className="mt-0.5 flex gap-1.5">
            {questionAlternatives.map((_, i) => (
              <span
                key={i}
                className={`rounded-full transition-all duration-200 ${
                  i === questionIndex
                    ? 'h-1.5 w-4 bg-amber-400'
                    : 'h-1.5 w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>
        )}
      </button>

      <button
        type="button"
        onClick={() => void handleSend()}
        disabled={disabled}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg transition-all duration-200 ${
          disabled
            ? 'opacity-20'
            : 'bg-indigo-600/60 text-white shadow-md shadow-indigo-900/30 hover:bg-indigo-500/70 active:scale-90'
        }`}
        aria-label="发送"
      >
        ✈️
      </button>
    </div>
  );
}
