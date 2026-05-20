import { v4 as uuidv4 } from 'uuid';

interface GameSession {
  id: string;
  puzzleId: string;
  history: { role: 'player' | 'host'; content: string }[];
  confirmedClues: string[];
  unlockedCards: string[];
  questionCount: number;
  irrelevantStreak: number;
  createdAt: number;
}

const sessions = new Map<string, GameSession>();

export function createSession(puzzleId: string): GameSession {
  const session: GameSession = {
    id: uuidv4(),
    puzzleId,
    history: [],
    confirmedClues: [],
    unlockedCards: [],
    questionCount: 0,
    irrelevantStreak: 0,
    createdAt: Date.now(),
  };
  sessions.set(session.id, session);
  return session;
}

export function getSession(id: string): GameSession | undefined {
  return sessions.get(id);
}

export function updateSession(id: string, updates: Partial<GameSession>): GameSession | undefined {
  const session = sessions.get(id);
  if (!session) return undefined;
  Object.assign(session, updates);
  return session;
}

export function addToHistory(
  sessionId: string,
  role: 'player' | 'host',
  content: string
): void {
  const session = sessions.get(sessionId);
  if (session) {
    session.history.push({ role, content });
  }
}

export function addClue(sessionId: string, clue: string): void {
  const session = sessions.get(sessionId);
  if (session) {
    session.confirmedClues.push(clue);
  }
}

export function incrementQuestion(sessionId: string): void {
  const session = sessions.get(sessionId);
  if (session) {
    session.questionCount++;
  }
}

export function updateIrrelevantStreak(sessionId: string, reset: boolean): number {
  const session = sessions.get(sessionId);
  if (!session) return 0;
  if (reset) {
    session.irrelevantStreak = 0;
  } else {
    session.irrelevantStreak++;
  }
  return session.irrelevantStreak;
}
