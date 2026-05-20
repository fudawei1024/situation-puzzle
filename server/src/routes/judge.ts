import { Router } from 'express';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { judgeQuestion } from '../services/llm.js';
import {
  getSession,
  createSession,
  addToHistory,
  addClue,
  incrementQuestion,
  updateIrrelevantStreak,
} from '../services/game-session.js';

export const judgeRouter = Router();

function loadPuzzle(id: string) {
  const puzzlesDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'puzzles');
  try {
    const files = readdirSync(puzzlesDir).filter(f => f.endsWith('.json'));
    for (const f of files) {
      const content = readFileSync(join(puzzlesDir, f), 'utf-8');
      const puzzle = JSON.parse(content);
      if (puzzle.id === id) return puzzle;
    }
  } catch {}
  return null;
}

judgeRouter.post('/', async (req, res) => {
  try {
    const { sessionId, puzzleId, question } = req.body;

    let session = sessionId ? getSession(sessionId) : null;
    if (!session) {
      session = createSession(puzzleId);
    }

    const puzzle = loadPuzzle(puzzleId);
    if (!puzzle) {
      res.status(404).json({ error: 'Puzzle not found' });
      return;
    }

    addToHistory(session.id, 'player', question);
    incrementQuestion(session.id);

    const result = await judgeQuestion(
      puzzle.surface,
      puzzle.truth,
      session.history,
      question,
      session.confirmedClues
    );

    addToHistory(session.id, 'host', result.reply);

    if (result.answer === 'yes' && result.newClue) {
      addClue(session.id, result.newClue);
    }

    const streak = updateIrrelevantStreak(
      session.id,
      result.answer !== 'irrelevant'
    );

    res.json({
      sessionId: session.id,
      ...result,
      irrelevantStreak: streak,
      questionCount: session.questionCount,
    });
  } catch (error) {
    console.error('Judge error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
