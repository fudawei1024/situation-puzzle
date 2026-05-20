import type { ClueNote, HypothesisNote, RedStringConnection } from '../../types/index.ts';

const CLUE_WIDTH = 120;
const CLUE_HEIGHT = 80;
const HYPOTHESIS_WIDTH = 140;
const HYPOTHESIS_HEIGHT = 90;

function getNoteCenter(note: ClueNote | HypothesisNote): { x: number; y: number } {
  const isHypothesis = !('rotation' in note);
  const w = isHypothesis ? HYPOTHESIS_WIDTH : CLUE_WIDTH;
  const h = isHypothesis ? HYPOTHESIS_HEIGHT : CLUE_HEIGHT;
  return { x: note.x + w / 2, y: note.y + h / 2 };
}

interface RedStringProps {
  connection: RedStringConnection;
  notes: (ClueNote | HypothesisNote)[];
  deleteMode: boolean;
  onRemove: (id: string) => void;
}

export function RedString({ connection, notes, deleteMode, onRemove }: RedStringProps) {
  const fromNote = notes.find((n) => n.id === connection.fromNoteId);
  const toNote = notes.find((n) => n.id === connection.toNoteId);

  if (!fromNote || !toNote) return null;

  const from = getNoteCenter(fromNote);
  const to = getNoteCenter(toNote);
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const curveOffset = Math.min(40, Math.hypot(dx, dy) * 0.15);
  const ctrlX = midX - dy * 0.1;
  const ctrlY = midY + dx * 0.1 + curveOffset;

  const pathD = `M ${from.x} ${from.y} Q ${ctrlX} ${ctrlY} ${to.x} ${to.y}`;

  const handleClick = () => {
    if (deleteMode) onRemove(connection.id);
  };

  return (
    <path
      d={pathD}
      fill="none"
      stroke="#CC0000"
      strokeWidth={2}
      strokeDasharray="6 4"
      pointerEvents="stroke"
      style={{ cursor: deleteMode ? 'pointer' : 'default' }}
      onClick={handleClick}
    />
  );
}
