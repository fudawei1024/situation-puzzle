import type { ClueNote, HypothesisNote } from '../../types/index.ts';

const NOTE_CELL_WIDTH = 160;
const PADDING = 24;
const GRID_GAP = 16;

export function autoLayoutNotes(
  notes: (ClueNote | HypothesisNote)[],
  containerWidth: number,
  containerHeight: number
): { id: string; x: number; y: number }[] {
  if (notes.length === 0) return [];

  const columns = Math.max(
    1,
    Math.floor((containerWidth - PADDING * 2) / NOTE_CELL_WIDTH)
  );
  const rows = Math.ceil(notes.length / columns);
  const cellWidth = (containerWidth - PADDING * 2 - GRID_GAP * (columns - 1)) / columns;
  const cellHeight =
    rows > 0
      ? (containerHeight - PADDING * 2 - GRID_GAP * (rows - 1)) / rows
      : containerHeight - PADDING * 2;

  return notes.map((note, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    return {
      id: note.id,
      x: PADDING + col * (cellWidth + GRID_GAP),
      y: PADDING + row * (cellHeight + GRID_GAP),
    };
  });
}
