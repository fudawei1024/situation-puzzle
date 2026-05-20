import { useRef } from 'react';
import { useGameStore } from '../../engine/gameStore.ts';
import type { ClueNote as ClueNoteType } from '../../types/index.ts';

interface ClueNoteProps {
  note: ClueNoteType;
  deleteMode: boolean;
  connectionMode: boolean;
  isConnectingFrom: boolean;
  onConnectionClick: (noteId: string) => void;
}

export function ClueNote({
  note,
  deleteMode,
  connectionMode,
  isConnectingFrom,
  onConnectionClick,
}: ClueNoteProps) {
  const updateClueNote = useGameStore((s) => s.updateClueNote);
  const removeClueNote = useGameStore((s) => s.removeClueNote);
  const dragRef = useRef<{ startX: number; startY: number; noteX: number; noteY: number } | null>(
    null
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    if (connectionMode || deleteMode) return;
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
    updateClueNote(note.id, {
      x: dragRef.current.noteX + dx,
      y: dragRef.current.noteY + dy,
    });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteMode) {
      removeClueNote(note.id);
      return;
    }
    if (connectionMode) {
      onConnectionClick(note.id);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (connectionMode || deleteMode) return;
    updateClueNote(note.id, { isHighlighted: !note.isHighlighted });
  };

  return (
    <div
      role="presentation"
      className="absolute select-none touch-none"
      style={{
        left: note.x,
        top: note.y,
        width: 120,
        height: 80,
        transform: `rotate(${note.rotation}deg)`,
        boxShadow: note.isHighlighted ? '0 0 15px gold' : '2px 3px 8px rgba(0,0,0,0.35)',
        outline: isConnectingFrom ? '2px dashed #CC0000' : undefined,
        zIndex: note.isHighlighted ? 10 : 2,
        cursor: deleteMode ? 'pointer' : connectionMode ? 'crosshair' : 'grab',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className="relative flex h-full w-full flex-col rounded-sm p-2"
        style={{ background: '#FFEEBB' }}
      >
        <span className="absolute -left-1 -top-1 text-xs" aria-hidden>
          📌
        </span>
        <p
          className="mt-2 flex-1 overflow-hidden text-xs leading-snug"
          style={{ fontFamily: 'cursive' }}
        >
          {note.content}
        </p>
        <span className="truncate text-[10px] text-gray-500">{note.source}</span>
      </div>
    </div>
  );
}
