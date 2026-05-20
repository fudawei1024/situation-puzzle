import { useState, useMemo } from 'react';
import { ChatArea } from '../dialogue/ChatArea.tsx';
import { FreeInputMode } from '../dialogue/FreeInputMode.tsx';
import { QuestionPreview } from '../dialogue/QuestionPreview.tsx';
import { HandArea } from '../cards/HandArea.tsx';
import { useGameStore } from '../../engine/gameStore.ts';
import { TopBar } from './TopBar.tsx';

function HostArea() {
  const currentPuzzle = useGameStore((s) => s.currentPuzzle);
  const isLoading = useGameStore((s) => s.isLoading);

  const atmosphereText = useMemo(() => {
    const texts: Record<string, string> = {
      bar: '酒吧里弥漫着淡淡的烟味，灯光昏暗...',
      hospital: '消毒水的气味无处不在...',
      house: '老宅的木地板嘎吱作响...',
      street: '夜色中的街道空无一人...',
    };
    return texts[currentPuzzle?.atmosphere ?? ''] ?? '今夜，真相隐藏在迷雾之中...';
  }, [currentPuzzle]);

  return (
    <section className="relative shrink-0 overflow-hidden" style={{ height: '22%' }}>
      {/* Animated gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.5) 0%, rgba(15, 12, 40, 0.8) 40%, rgba(45, 20, 60, 0.4) 100%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(99, 102, 241, 0.2) 0%, transparent 60%)',
          animation: 'orbDrift 6s ease-in-out infinite alternate',
        }}
      />

      <div className="relative flex h-full flex-col items-center justify-center px-6 pt-11 text-center">
        <div className={`host-bounce text-5xl ${isLoading ? 'animate-pulse' : ''}`}>
          🎩
        </div>
        <p className="mt-2 text-xs leading-relaxed text-white/40 italic fade-in">
          {atmosphereText}
        </p>
        {isLoading && (
          <div className="mt-1 flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-indigo-400/60 animate-bounce [animation-delay:0ms]" />
            <span className="h-1 w-1 rounded-full bg-indigo-400/60 animate-bounce [animation-delay:100ms]" />
            <span className="h-1 w-1 rounded-full bg-indigo-400/60 animate-bounce [animation-delay:200ms]" />
          </div>
        )}
      </div>
    </section>
  );
}

export function GameScreen() {
  const [freeInputOpen, setFreeInputOpen] = useState(false);

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#0a0a10]">
      <TopBar />
      <HostArea />
      <ChatArea />
      <QuestionPreview />

      {freeInputOpen && (
        <FreeInputMode visible onToggle={() => setFreeInputOpen(false)} />
      )}

      <HandArea
        freeInputOpen={freeInputOpen}
        onToggleFreeInput={() => setFreeInputOpen((v) => !v)}
      />
    </div>
  );
}
