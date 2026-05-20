import { useEffect, useState, useRef } from 'react';
import { CorkBoard } from './components/board/CorkBoard.tsx';
import { RevealCeremony } from './components/reveal/RevealCeremony.tsx';
import { GameScreen } from './components/ui/GameScreen.tsx';
import { HomeScreen } from './components/ui/HomeScreen.tsx';
import { SurfaceScreen } from './components/ui/SurfaceScreen.tsx';
import { useGameStore } from './engine/gameStore.ts';
import type { GamePhase } from './types/index.ts';

function PhaseTransition({ phase, children }: { phase: GamePhase; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [displayPhase, setDisplayPhase] = useState(phase);
  const prevPhase = useRef(phase);

  useEffect(() => {
    if (phase !== prevPhase.current) {
      setVisible(false);
      const t = setTimeout(() => {
        setDisplayPhase(phase);
        setVisible(true);
        prevPhase.current = phase;
      }, 300);
      return () => clearTimeout(t);
    }
    setVisible(true);
    setDisplayPhase(phase);
  }, [phase]);

  return (
    <div
      className="h-full w-full"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.98)',
        transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
      }}
      key={displayPhase}
    >
      {children}
    </div>
  );
}

function App() {
  const phase = useGameStore((s) => s.phase);
  const showBoard = useGameStore((s) => s.showBoard);

  return (
    <div className="mx-auto h-screen w-full max-w-[430px] overflow-hidden bg-[#080810] text-white">
      <PhaseTransition phase={phase}>
        {phase === 'home' && <HomeScreen />}
        {phase === 'surface' && <SurfaceScreen />}
        {phase === 'playing' && <GameScreen />}
        {phase === 'reveal' && <RevealCeremony />}
      </PhaseTransition>
      {showBoard && phase === 'playing' && <CorkBoard />}
    </div>
  );
}

export default App;
