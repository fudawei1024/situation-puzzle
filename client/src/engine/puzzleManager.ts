import type { FreeAskRequest, JudgeRequest, JudgeResponse, Puzzle } from '../types/index.ts';

const API_BASE = '/api';

export interface PuzzleSummary {
  id: string;
  name: string;
  surface: string;
  difficulty: string;
  atmosphere: string;
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new ApiError(message, res.status);
  }
  return res.json() as Promise<T>;
}

export async function fetchPuzzles(): Promise<PuzzleSummary[]> {
  const res = await fetch(`${API_BASE}/puzzles`);
  return parseJsonResponse<PuzzleSummary[]>(res);
}

export async function fetchPuzzle(id: string): Promise<Puzzle> {
  const res = await fetch(`${API_BASE}/puzzles/${encodeURIComponent(id)}`);
  return parseJsonResponse<Puzzle>(res);
}

export async function submitQuestion(
  req: JudgeRequest,
): Promise<JudgeResponse & { sessionId: string }> {
  const res = await fetch(`${API_BASE}/judge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  return parseJsonResponse<JudgeResponse & { sessionId: string }>(res);
}

export async function submitFreeQuestion(
  req: FreeAskRequest,
): Promise<JudgeResponse & { sessionId: string }> {
  const res = await fetch(`${API_BASE}/free-ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  return parseJsonResponse<JudgeResponse & { sessionId: string }>(res);
}

export async function fetchReveal(puzzleId: string): Promise<{ truth: string; coreTruth: string }> {
  const res = await fetch(`${API_BASE}/puzzles/${encodeURIComponent(puzzleId)}/reveal`);
  return parseJsonResponse<{ truth: string; coreTruth: string }>(res);
}

export { ApiError };
