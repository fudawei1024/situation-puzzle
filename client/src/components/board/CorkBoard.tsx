import { useCallback, useRef, useState } from 'react';
import { useGameStore } from '../../engine/gameStore.ts';
import type { ClueNote, HypothesisNote } from '../../types/index.ts';
import { autoLayoutNotes } from './AutoLayout.ts';
import { ClueNote as ClueNoteComponent } from './ClueNote.tsx';
import { HypothesisNoteComponent } from './HypothesisNoteComponent.tsx';
import { RedString } from './RedString.tsx';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface CorkBoardProps {
  onSubmitInference?: () => void;
}

export function CorkBoard({ onSubmitInference }: CorkBoardProps) {
  const currentPuzzle = useGameStore((s) => s.currentPuzzle);
  const clueNotes = useGameStore((s) => s.clueNotes);
  const hypotheses = useGameStore((s) => s.hypotheses);
  const connections = useGameStore((s) => s.connections);
  const setShowBoard = useGameStore((s) => s.setShowBoard);
  const submitInference = useGameStore((s) => s.submitInference);
  const addHypothesis = useGameStore((s) => s.addHypothesis);
  const addConnection = useGameStore((s) => s.addConnection);
  const removeConnection = useGameStore((s) => s.removeConnection);
  const updateClueNote = useGameStore((s) => s.updateClueNote);
  const updateHypothesis = useGameStore((s) => s.updateHypothesis);

  const [connectionMode, setConnectionMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);

  const allNotes: (ClueNote | HypothesisNote)[] = [...clueNotes, ...hypotheses];

  const handleConnectionClick = useCallback(
    (noteId: string) => {
      if (!connectingFrom) {
        setConnectingFrom(noteId);
        return;
      }
      if (connectingFrom === noteId) {
        setConnectingFrom(null);
        return;
      }
      const exists = connections.some(
        (c) =>
          (c.fromNoteId === connectingFrom && c.toNoteId === noteId) ||
          (c.fromNoteId === noteId && c.toNoteId === connectingFrom)
      );
      if (!exists) {
        addConnection({
          id: generateId(),
          fromNoteId: connectingFrom,
          toNoteId: noteId,
        });
      }
      setConnectingFrom(null);
    },
    [connectingFrom, connections, addConnection]
  );

  const handleBoardDoubleClick = (e: React.MouseEvent) => {
    if (e.target !== boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 70;
    const y = e.clientY - rect.top - 45;
    addHypothesis({
      id: generateId(),
      content: '新假说…',
      x: Math.max(0, x),
      y: Math.max(0, y),
    });
  };

  const handleAutoLayout = () => {
    const el = boardRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const positions = autoLayoutNotes(allNotes, width, height);
    for (const pos of positions) {
      const clue = clueNotes.find((n) => n.id === pos.id);
      if (clue) {
        updateClueNote(pos.id, { x: pos.x, y: pos.y });
        continue;
      }
      const hyp = hypotheses.find((n) => n.id === pos.id);
      if (hyp) {
        updateHypothesis(pos.id, { x: pos.x, y: pos.y });
      }
    }
  };

  const handleAddHypothesis = () => {
    const el = boardRef.current;
    const w = el?.clientWidth ?? 400;
    const h = el?.clientHeight ?? 300;
    addHypothesis({
      id: generateId(),
      content: '新假说…',
      x: w / 2 - 70,
      y: h / 2 - 45,
    });
  };

  const toggleConnectionMode = () => {
    setConnectionMode((v) => !v);
    setConnectingFrom(null);
    if (!connectionMode) setDeleteMode(false);
  };

  const toggleDeleteMode = () => {
    setDeleteMode((v) => !v);
    setConnectingFrom(null);
    if (!deleteMode) setConnectionMode(false);
  };

  const toolbarBtn =
    'rounded-lg px-3 py-2 text-sm text-amber-100/90 hover:bg-black/25 active:bg-black/40';

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{
        background:
          'radial-gradient(ellipse at 30% 20%, #8B6914 0%, #6B4F10 35%, #4A3510 70%, #3D2B0E 100%)',
      }}
    >
      <header className="flex shrink-0 items-center justify-between border-b border-black/30 bg-black/25 px-4 py-3 backdrop-blur-sm">
        <h2 className="truncate text-lg font-semibold text-amber-50">
          {currentPuzzle?.name ?? '推理板'}
        </h2>
        <button
          type="button"
          className="rounded-lg bg-amber-600/80 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500"
          onClick={() => {
            setShowBoard(false);
            if (onSubmitInference) {
              onSubmitInference();
            } else {
              submitInference();
            }
          }}
        >
          提交推理
        </button>
      </header>

      <div
        ref={boardRef}
        className="relative min-h-0 flex-1 overflow-hidden"
        onDoubleClick={handleBoardDoubleClick}
      >
        <svg className="absolute inset-0 h-full w-full" style={{ zIndex: 1 }}>
          <g>
            {connections.map((conn) => (
              <RedString
                key={conn.id}
                connection={conn}
                notes={allNotes}
                deleteMode={deleteMode}
                onRemove={removeConnection}
              />
            ))}
          </g>
        </svg>

        {clueNotes.map((note) => (
          <ClueNoteComponent
            key={note.id}
            note={note}
            deleteMode={deleteMode}
            connectionMode={connectionMode}
            isConnectingFrom={connectingFrom === note.id}
            onConnectionClick={handleConnectionClick}
          />
        ))}

        {hypotheses.map((note) => (
          <HypothesisNoteComponent
            key={note.id}
            note={note}
            deleteMode={deleteMode}
            connectionMode={connectionMode}
            isConnectingFrom={connectingFrom === note.id}
            onConnectionClick={handleConnectionClick}
          />
        ))}
      </div>

      <footer className="flex shrink-0 flex-wrap items-center justify-center gap-2 border-t border-black/30 bg-black/25 px-3 py-3 backdrop-blur-sm">
        <button
          type="button"
          className={`${toolbarBtn} ${connectionMode ? 'bg-red-900/50 ring-1 ring-red-400/60' : ''}`}
          onClick={toggleConnectionMode}
          title="连线模式"
        >
          🔗
        </button>
        <button type="button" className={toolbarBtn} onClick={handleAddHypothesis} title="添加假说">
          📝
        </button>
        <button type="button" className={toolbarBtn} onClick={handleAutoLayout} title="自动布局">
          🔄
        </button>
        <button
          type="button"
          className={`${toolbarBtn} ${deleteMode ? 'bg-red-900/50 ring-1 ring-red-400/60' : ''}`}
          onClick={toggleDeleteMode}
          title="删除模式"
        >
          🗑️
        </button>
        <button
          type="button"
          className={toolbarBtn}
          onClick={() => setShowBoard(false)}
          title="关闭推理板"
        >
          ✕
        </button>
      </footer>
    </div>
  );
}
