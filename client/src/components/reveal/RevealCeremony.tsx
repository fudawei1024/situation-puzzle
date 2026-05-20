import { useEffect, useState } from 'react';
import { useGameStore } from '../../engine/gameStore.ts';
import { fetchReveal } from '../../engine/puzzleManager.ts';
import { calculateRating } from '../../systems/ratingSystem.ts';
import { DetectiveReport } from './DetectiveReport.tsx';

type RevealStage = 'fade' | 'countdown' | 'title' | 'truth' | 'report';

const COUNTDOWN_NUMBERS = ['3', '2', '1'] as const;
const TYPEWRITER_MS = 35;

export function RevealCeremony() {
  const currentPuzzle = useGameStore((s) => s.currentPuzzle);
  const questionCount = useGameStore((s) => s.questionCount);
  const clueNotes = useGameStore((s) => s.clueNotes);
  const rating = useGameStore((s) => s.rating);
  const resetGame = useGameStore((s) => s.resetGame);

  const [stage, setStage] = useState<RevealStage>('fade');
  const [countdownIndex, setCountdownIndex] = useState(0);
  const [showTitle, setShowTitle] = useState(false);
  const [typedTruth, setTypedTruth] = useState('');
  const [showKeyReveal, setShowKeyReveal] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const [truthText, setTruthText] = useState('');
  const [coreTruthText, setCoreTruthText] = useState<string | null>(null);

  // Fetch the real truth from server
  useEffect(() => {
    if (!currentPuzzle) return;
    fetchReveal(currentPuzzle.id)
      .then((data) => {
        setTruthText(data.truth);
        setCoreTruthText(data.coreTruth);
      })
      .catch(() => {
        setTruthText('推理完成！感谢你的参与。');
        setCoreTruthText(null);
      });
  }, [currentPuzzle]);

  // Stage: fade → countdown
  useEffect(() => {
    if (stage !== 'fade') return;
    const t = setTimeout(() => setStage('countdown'), 600);
    return () => clearTimeout(t);
  }, [stage]);

  // Stage: countdown 3-2-1
  useEffect(() => {
    if (stage !== 'countdown') return;
    if (countdownIndex >= COUNTDOWN_NUMBERS.length) {
      const t = setTimeout(() => setStage('title'), 300);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCountdownIndex((i) => i + 1), 800);
    return () => clearTimeout(t);
  }, [stage, countdownIndex]);

  // Stage: title
  useEffect(() => {
    if (stage !== 'title') return;
    const showT = setTimeout(() => setShowTitle(true), 200);
    const next = setTimeout(() => setStage('truth'), 1500);
    return () => {
      clearTimeout(showT);
      clearTimeout(next);
    };
  }, [stage]);

  // Stage: truth typewriter
  useEffect(() => {
    if (stage !== 'truth' || !truthText) return;
    if (typedTruth.length >= truthText.length) {
      const keyT = setTimeout(() => {
        if (coreTruthText) setShowKeyReveal(true);
      }, 500);
      const reportT = setTimeout(() => {
        setStage('report');
        setTimeout(() => setShowReport(true), 300);
      }, coreTruthText ? 2000 : 1000);
      return () => {
        clearTimeout(keyT);
        clearTimeout(reportT);
      };
    }
    const t = setTimeout(
      () => setTypedTruth(truthText.slice(0, typedTruth.length + 1)),
      TYPEWRITER_MS
    );
    return () => clearTimeout(t);
  }, [stage, typedTruth, truthText, coreTruthText]);

  const handleGoHome = () => resetGame();
  const handlePlayAgain = () => resetGame();

  const displayRating = rating ?? calculateRating(questionCount);

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-y-auto px-6 py-10"
      style={{ background: '#000' }}
    >
      {/* Ambient particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${15 + Math.random() * 70}%`,
              bottom: '-5%',
              width: 4 + Math.random() * 4,
              height: 4 + Math.random() * 4,
              background: 'rgba(232, 200, 150, 0.3)',
              animation: `particleFloat ${12 + Math.random() * 10}s linear ${Math.random() * 6}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Fade overlay */}
      <div
        className="pointer-events-none fixed inset-0 bg-black transition-opacity duration-700"
        style={{ opacity: stage === 'fade' ? 1 : 0 }}
      />

      {/* Countdown */}
      {stage === 'countdown' && countdownIndex < COUNTDOWN_NUMBERS.length && (
        <p
          className="countdown-num relative z-10 text-9xl font-bold tracking-widest"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            color: '#C4A882',
            textShadow: '0 0 60px rgba(196, 168, 130, 0.5), 0 0 120px rgba(196, 168, 130, 0.2)',
          }}
          key={countdownIndex}
        >
          {COUNTDOWN_NUMBERS[countdownIndex]}
        </p>
      )}

      {/* Title + Truth + Report */}
      {(stage === 'title' || stage === 'truth' || stage === 'report') && (
        <div className="relative z-10 flex w-full max-w-md flex-col items-center">
          {showTitle && (
            <h1
              className="shimmer-text mb-8 text-center text-3xl font-bold tracking-[0.4em] scale-pop"
              style={{
                textShadow: '0 0 30px rgba(232, 200, 150, 0.3), 0 0 60px rgba(232, 200, 150, 0.1)',
              }}
            >
              汤底揭晓
            </h1>
          )}

          {(stage === 'truth' || stage === 'report') && (
            <div className="mb-6 w-full text-center leading-relaxed slide-up">
              <p className="text-base text-amber-200/90 whitespace-pre-wrap">
                {typedTruth}
                {typedTruth.length < truthText.length && (
                  <span className="typewriter-cursor" />
                )}
              </p>
              {showKeyReveal && coreTruthText && (
                <div className="mt-8 scale-pop">
                  <div className="mx-auto mb-2 h-px w-20 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                  <p className="text-xs tracking-widest text-amber-400/50">关键揭示</p>
                  <p
                    className="mt-2 text-xl font-bold"
                    style={{
                      color: '#FFD700',
                      textShadow: '0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.15)',
                    }}
                  >
                    {coreTruthText}
                  </p>
                </div>
              )}
            </div>
          )}

          {stage === 'report' && showReport && (
            <div className="scale-pop w-full">
              <DetectiveReport
                puzzleName={currentPuzzle?.name ?? '未知案件'}
                questionCount={questionCount}
                clueCount={clueNotes.length}
                rating={displayRating}
                onPlayAgain={handlePlayAgain}
              />
            </div>
          )}
        </div>
      )}

      {stage === 'report' && showReport && (
        <button
          type="button"
          onClick={handleGoHome}
          className="relative z-10 mt-8 rounded-lg border border-amber-800/40 px-8 py-2.5 text-sm text-amber-200/70 transition-all duration-300 hover:border-amber-600/50 hover:text-amber-100 hover:-translate-y-0.5 active:translate-y-0 fade-in"
          style={{ animationDelay: '0.5s' }}
        >
          返回首页
        </button>
      )}
    </div>
  );
}
