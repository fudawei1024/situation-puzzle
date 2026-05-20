import { useState, useMemo } from 'react';
import { useGameStore } from '../../engine/gameStore.ts';
import { fetchPuzzle, fetchPuzzles, type PuzzleSummary } from '../../engine/puzzleManager.ts';
import type { Puzzle } from '../../types/index.ts';

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

const DIFFICULTY_STYLE: Record<string, string> = {
  easy: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  medium: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  hard: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
};

function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 3 + Math.random() * 6,
        duration: 8 + Math.random() * 12,
        delay: Math.random() * 10,
        opacity: 0.2 + Math.random() * 0.4,
      })),
    []
  );

  return (
    <div className="particle-container">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}

export function HomeScreen() {
  const loadPuzzle = useGameStore((s) => s.loadPuzzle);
  const setPhase = useGameStore((s) => s.setPhase);

  const [puzzles, setPuzzles] = useState<PuzzleSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchPuzzles();
      setPuzzles(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载谜题失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPuzzle = async (summary: PuzzleSummary) => {
    setSelectingId(summary.id);
    setError(null);
    try {
      const puzzle: Puzzle = await fetchPuzzle(summary.id);
      loadPuzzle(puzzle);
      setPhase('surface');
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载谜题详情失败');
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <div className="relative flex min-h-full flex-col bg-gradient-to-b from-[#0a0a12] via-[#12101f] to-[#0d0d14] px-5 py-10">
      <FloatingParticles />

      {/* Ambient glow orbs */}
      <div className="glow-orb" style={{ top: '15%', left: '10%', width: 200, height: 200, background: 'rgba(99, 102, 241, 0.3)' }} />
      <div className="glow-orb" style={{ top: '60%', right: '5%', width: 160, height: 160, background: 'rgba(167, 139, 250, 0.25)', animationDelay: '3s' }} />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
        {/* Main title with shimmer */}
        <h1
          className="shimmer-text text-5xl font-bold tracking-[0.2em]"
          style={{
            textShadow: '0 0 40px rgba(147, 197, 253, 0.3), 0 0 80px rgba(99, 102, 241, 0.15)',
          }}
        >
          海龟汤·境
        </h1>

        <p
          className="mt-4 text-sm tracking-[0.3em] text-white/40 slide-up"
          style={{ animationDelay: '0.3s' }}
        >
          关键词卡牌推理游戏
        </p>

        <div
          className="mt-2 h-px w-24 bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent slide-up"
          style={{ animationDelay: '0.5s' }}
        />

        {!puzzles && (
          <button
            type="button"
            onClick={() => void handleStart()}
            disabled={loading}
            className="slide-up mt-12 rounded-full bg-gradient-to-r from-indigo-600 to-violet-700 px-12 py-3.5 text-base font-medium text-white shadow-lg shadow-indigo-900/50 transition-all duration-300 hover:from-indigo-500 hover:to-violet-600 hover:shadow-xl hover:shadow-indigo-800/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
            style={{ animationDelay: '0.7s' }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                加载中…
              </span>
            ) : (
              '开始游戏'
            )}
          </button>
        )}

        {error && (
          <p className="mt-4 text-sm text-rose-400 fade-in">{error}</p>
        )}
      </div>

      {puzzles && puzzles.length > 0 && (
        <div className="relative z-10 mt-6 flex flex-col gap-3 pb-8">
          <p className="text-center text-xs tracking-widest text-white/30 fade-in">— 选择谜题 —</p>
          {puzzles.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => void handleSelectPuzzle(p)}
              disabled={selectingId === p.id}
              className="puzzle-card slide-up rounded-xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-sm hover:border-indigo-400/40 hover:bg-white/10 disabled:opacity-60"
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-medium text-white/90">{p.name}</span>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs ${
                    DIFFICULTY_STYLE[p.difficulty] ?? DIFFICULTY_STYLE.medium
                  }`}
                >
                  {DIFFICULTY_LABEL[p.difficulty] ?? p.difficulty}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-white/45">
                {p.surface.length > 50 ? `${p.surface.slice(0, 50)}…` : p.surface}
              </p>
              {selectingId === p.id && (
                <div className="mt-2 flex items-center gap-2 text-xs text-indigo-300">
                  <span className="h-3 w-3 animate-spin rounded-full border border-indigo-300/30 border-t-indigo-300" />
                  载入中…
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {puzzles && puzzles.length === 0 && (
        <p className="relative z-10 text-center text-sm text-white/40 fade-in">暂无可用谜题</p>
      )}
    </div>
  );
}
