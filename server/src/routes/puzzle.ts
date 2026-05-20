import { Router } from 'express';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export const puzzleRouter = Router();

function loadPuzzles() {
  const puzzlesDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'puzzles');
  try {
    const files = readdirSync(puzzlesDir).filter(f => f.endsWith('.json'));
    return files.map(f => {
      const content = readFileSync(join(puzzlesDir, f), 'utf-8');
      return JSON.parse(content);
    });
  } catch {
    return [];
  }
}

puzzleRouter.get('/', (_req, res) => {
  const puzzles = loadPuzzles();
  const summaries = puzzles.map(p => ({
    id: p.id,
    name: p.name,
    surface: p.surface,
    difficulty: p.difficulty,
    atmosphere: p.atmosphere,
  }));
  res.json(summaries);
});

puzzleRouter.get('/:id', (req, res) => {
  const puzzles = loadPuzzles();
  const puzzle = puzzles.find(p => p.id === req.params.id);
  if (!puzzle) {
    res.status(404).json({ error: 'Puzzle not found' });
    return;
  }
  const { truth, coreTruth, cardAnswerMap, unlockRules, distractors, ...publicData } = puzzle;
  res.json(publicData);
});

puzzleRouter.get('/:id/reveal', (req, res) => {
  const puzzles = loadPuzzles();
  const puzzle = puzzles.find(p => p.id === req.params.id);
  if (!puzzle) {
    res.status(404).json({ error: 'Puzzle not found' });
    return;
  }
  res.json({
    truth: puzzle.truth,
    coreTruth: puzzle.coreTruth,
  });
});
