import { useGameStore } from '../../engine/gameStore.ts';

export function TopBar() {
  const currentPuzzle = useGameStore((s) => s.currentPuzzle);
  const showBoard = useGameStore((s) => s.showBoard);
  const questionCount = useGameStore((s) => s.questionCount);
  const setPhase = useGameStore((s) => s.setPhase);
  const setShowBoard = useGameStore((s) => s.setShowBoard);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-11 max-w-[430px] mx-auto items-center justify-between bg-gradient-to-b from-black/90 to-black/60 px-3 backdrop-blur-md">
      <button
        type="button"
        onClick={() => setPhase('home')}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all duration-200 hover:bg-white/10 active:scale-90"
        aria-label="返回首页"
      >
        🔙
      </button>

      <div className="flex flex-1 flex-col items-center px-2">
        <h1 className="truncate text-sm font-medium text-white/90">
          {currentPuzzle?.name ?? '海龟汤·境'}
        </h1>
        {questionCount > 0 && (
          <span className="text-[10px] text-white/30">已提问 {questionCount} 次</span>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowBoard(!showBoard)}
        className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all duration-200 hover:bg-white/10 active:scale-90 ${
          showBoard ? 'bg-amber-500/25 ring-1 ring-amber-400/50 scale-110' : ''
        }`}
        aria-label="推理板"
      >
        📌
      </button>
    </header>
  );
}
