import { useRef, useState } from 'react';
import { useGameStore } from '../../engine/gameStore.ts';
import type { HypothesisNote } from '../../types/index.ts';

interface HypothesisNoteComponentProps {
  note: HypothesisNote;
  connectionMode: boolean;
  deleteMode: boolean;
  isConnectingFrom: boolean;
  onConnectionClick: (noteId: string) => void;
}

export function HypothesisNoteComponent({
  note,
  connectionMode,
  deleteMode,
  isConnectingFrom,
  onConnectionClick,
}: HypothesisNoteComponentProps) {
  const updateHypothesis = useGameStore((s) => s.updateHypothesis);
  const removeHypothesis = useGameStore((s) => s.removeHypothesis);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.content);
  const dragRef = useRef<{ startX: number; startY: number; noteX: number; noteY: number } | null>(
    null
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    if (editing || connectionMode || deleteMode) return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      noteX: note.x,
      noteY: note.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    updateHypothesis(note.id, {
      x: dragRef.current.noteX + dx,
      y: dragRef.current.noteY + dy,
    });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleBlur = () => {
    setEditing(false);
    updateHypothesis(note.id, { content: draft.trim() || '新假说…' });
  };

  const handleClick = (e: React.MouseEvent) => {
    if (connectionMode) {
      e.stopPropagation();
      onConnectionClick(note.id);
      return;
    }
    if (deleteMode) {
      e.stopPropagation();
      removeHypothesis(note.id);
    }
  };

  return (
    <div
      role="presentation"
      className="absolute select-none touch-none"
      style={{
        left: note.x,
        top: note.y,
        width: 140,
        height: 90,
        boxShadow: '2px 3px 8px rgba(0,0,0,0.35)',
        outline: isConnectingFrom ? '2px dashed #CC0000' : undefined,
        zIndex: 3,
        cursor: deleteMode ? 'pointer' : connectionMode ? 'crosshair' : 'grab',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
    >
      <div
        className="relative flex h-full w-full flex-col rounded-sm p-2"
        style={{ background: '#B3E5FC' }}
      >
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-medium text-sky-800">💡 假说</span>
          <button
            type="button"
            className="flex h-4 w-4 items-center justify-center rounded text-[10px] text-sky-700 hover:bg-sky-200/60"
            aria-label="删除假说"
            onClick={(e) => {
              e.stopPropagation();
              removeHypothesis(note.id);
            }}
          >
            ✕
          </button>
        </div>
        {editing ? (
          <input
            type="text"
            className="flex-1 rounded border border-sky-300 bg-white/80 px-1 text-xs text-sky-900 outline-none"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
            autoFocus
          />
        ) : (
          <p
            className="flex-1 cursor-text overflow-hidden text-xs leading-snug text-sky-900"
            onClick={(e) => {
              e.stopPropagation();
              if (!connectionMode && !deleteMode) {
                setDraft(note.content);
                setEditing(true);
              }
            }}
          >
            {note.content}
          </p>
        )}
      </div>
    </div>
  );
}
