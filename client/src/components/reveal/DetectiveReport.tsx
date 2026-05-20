import { useEffect, useState } from 'react';
import { calculateRating, ratingColor, type DetectiveRating } from '../../systems/ratingSystem.ts';

interface DetectiveReportProps {
  puzzleName: string;
  questionCount: number;
  clueCount: number;
  rating?: string;
  onPlayAgain: () => void;
}

function AnimatedNumber({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCurrent(target);
        clearInterval(timer);
      } else {
        setCurrent(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <>{current}</>;
}

export function DetectiveReport({
  puzzleName,
  questionCount,
  clueCount,
  rating: ratingProp,
  onPlayAgain,
}: DetectiveReportProps) {
  const rating = (ratingProp ?? calculateRating(questionCount)) as DetectiveRating;
  const color = ratingColor(rating);
  const [showRating, setShowRating] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowRating(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="mx-auto w-full max-w-sm rounded-2xl border-2 p-6 shadow-2xl"
      style={{
        background: 'linear-gradient(145deg, #1a1510 0%, #0d0b08 100%)',
        borderColor: '#B8860B',
        boxShadow: '0 0 40px rgba(184, 134, 11, 0.2), 0 4px 20px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div className="mb-5 flex items-center gap-3 border-b border-amber-900/40 pb-4">
        <span className="text-3xl" role="img" aria-hidden>🕵️</span>
        <div>
          <h3 className="text-lg font-bold tracking-wide text-amber-100">结案报告</h3>
          <p className="text-xs text-amber-200/40">{puzzleName}</p>
        </div>
      </div>

      <dl className="space-y-4 text-sm">
        <div className="flex items-center justify-between gap-4 rounded-lg bg-white/5 px-3 py-2.5">
          <dt className="text-amber-200/50">🔎 提问次数</dt>
          <dd className="text-lg font-bold text-amber-50">
            <AnimatedNumber target={questionCount} />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-lg bg-white/5 px-3 py-2.5">
          <dt className="text-amber-200/50">📋 发现线索</dt>
          <dd className="text-lg font-bold text-amber-50">
            <AnimatedNumber target={clueCount} />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-lg bg-white/5 px-3 py-3">
          <dt className="text-amber-200/50">⭐ 侦探评级</dt>
          <dd>
            {showRating ? (
              <span
                className="scale-pop inline-block text-4xl font-black"
                style={{ color, textShadow: `0 0 20px ${color}88, 0 0 40px ${color}44` }}
              >
                {rating}
              </span>
            ) : (
              <span className="text-2xl text-white/20 animate-pulse">?</span>
            )}
          </dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={onPlayAgain}
        className="mt-6 w-full rounded-xl border border-amber-600/50 bg-gradient-to-r from-amber-700/40 to-amber-600/30 py-3.5 text-sm font-medium text-amber-100 transition-all duration-300 hover:from-amber-600/50 hover:to-amber-500/40 hover:-translate-y-0.5 active:translate-y-0"
      >
        再来一局
      </button>
    </div>
  );
}
