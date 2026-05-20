import { useEffect, useState, useCallback } from 'react';
import { ALL_CARDS, getCardById } from '../../data/cards.ts';
import { getPuzzleScenes } from '../../data/storyScenes.ts';
import { useGameStore } from '../../engine/gameStore.ts';
import type { StorySlide } from '../../types/index.ts';

const SLIDE_DURATION = 4000;

function SlideView({ slide, active }: { slide: StorySlide; active: boolean }) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (active) {
      setShowContent(false);
      const t = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(t);
    }
    setShowContent(false);
  }, [active]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: slide.background }}>
      {/* Central visual area */}
      <div className="flex flex-1 items-center justify-center">
        <div
          className="flex flex-col items-center"
          style={{
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'scale(1) translateY(0)' : 'scale(0.6) translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            transitionDelay: `${(slide.elements[0]?.delay ?? 300)}ms`,
          }}
        >
          {/* Main emoji with glow */}
          <div
            className="relative"
            style={{ fontSize: `${slide.elements[0]?.size ?? 6}rem`, lineHeight: 1 }}
          >
            <div
              className="absolute inset-0 blur-2xl opacity-30"
              style={{ fontSize: 'inherit' }}
            >
              {slide.elements[0]?.emoji}
            </div>
            <span className="relative">{slide.elements[0]?.emoji}</span>
          </div>

          {/* Mood text below icon */}
          {slide.mood && (
            <p
              className="mt-6 text-xs italic text-white/25 tracking-wider"
              style={{
                opacity: showContent ? 1 : 0,
                transition: 'opacity 1s ease',
                transitionDelay: '1s',
              }}
            >
              {slide.mood}
            </p>
          )}
        </div>
      </div>

      {/* Bottom narration card */}
      <div className="px-5 pb-28">
        <div
          className="rounded-2xl border border-white/8 bg-black/50 px-6 py-5 backdrop-blur-sm"
          style={{
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.7s ease-out',
            transitionDelay: '0.6s',
          }}
        >
          <p className="text-center text-base leading-[2] text-white/85 whitespace-pre-line">
            {slide.text}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SurfaceScreen() {
  const currentPuzzle = useGameStore((s) => s.currentPuzzle);
  const setPhase = useGameStore((s) => s.setPhase);
  const initializeHand = useGameStore((s) => s.initializeHand);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [slides, setSlides] = useState<StorySlide[]>([]);

  useEffect(() => {
    if (!currentPuzzle) return;
    setSlides(getPuzzleScenes(currentPuzzle.id, currentPuzzle.surface));
    setCurrentSlide(0);
  }, [currentPuzzle]);

  const isLastSlide = currentSlide >= slides.length - 1;

  useEffect(() => {
    if (!autoPlay || isLastSlide || slides.length === 0) return;
    const t = setTimeout(() => setCurrentSlide((p) => p + 1), SLIDE_DURATION);
    return () => clearTimeout(t);
  }, [currentSlide, autoPlay, isLastSlide, slides.length]);

  const goNext = useCallback(() => {
    if (!isLastSlide) {
      setCurrentSlide((p) => p + 1);
      setAutoPlay(false);
    }
  }, [isLastSlide]);

  const goPrev = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((p) => p - 1);
      setAutoPlay(false);
    }
  }, [currentSlide]);

  const handleStartPlaying = () => {
    if (!currentPuzzle) return;
    const cards = currentPuzzle.initialCards
      .map((id) => getCardById(id))
      .filter((c): c is NonNullable<typeof c> => c !== undefined);
    const fallback = currentPuzzle.initialCards
      .map((id) => ALL_CARDS.find((c) => c.id === id))
      .filter((c): c is NonNullable<typeof c> => c !== undefined);
    initializeHand(cards.length > 0 ? cards : fallback);
    setPhase('playing');
  };

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    if (x < 0.3) goPrev();
    else if (x > 0.7) goNext();
  };

  if (slides.length === 0) return null;

  return (
    <div className="relative h-full w-full overflow-hidden" onClick={handleTap}>
      {/* Slides */}
      {slides.map((slide, idx) => (
        <SlideView key={idx} slide={slide} active={idx === currentSlide} />
      ))}

      {/* Top: title */}
      <div className="absolute top-0 left-0 right-0 z-40 pt-5 px-6">
        <p className="text-center text-xs tracking-[0.4em] text-white/30">
          {currentPuzzle?.name}
        </p>
        <div className="mt-2 mx-auto h-px w-16 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      {/* Slide counter */}
      <div className="absolute top-14 right-5 z-40">
        <span className="text-xs text-white/20 tabular-nums">
          {currentSlide + 1} / {slides.length}
        </span>
      </div>

      {/* Progress dots */}
      <div className="absolute z-40 left-0 right-0 flex justify-center gap-2" style={{ bottom: 92 }}>
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); setAutoPlay(false); }}
            className={`rounded-full transition-all duration-400 ${
              idx === currentSlide ? 'h-1.5 w-5 bg-white/60' :
              idx < currentSlide ? 'h-1.5 w-1.5 bg-white/25' : 'h-1.5 w-1.5 bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Bottom button */}
      <div className="absolute bottom-0 left-0 right-0 z-40 px-6 pb-6">
        {isLastSlide ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleStartPlaying(); }}
            className="w-full rounded-xl border border-white/15 bg-white/10 py-4 text-base font-medium text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/15 active:bg-white/20"
          >
            开始推理
          </button>
        ) : (
          <p className="text-center text-[10px] text-white/15">
            {currentSlide === 0 ? '点击右侧翻页 →' : '← 左侧回看　　右侧翻页 →'}
          </p>
        )}
      </div>
    </div>
  );
}
