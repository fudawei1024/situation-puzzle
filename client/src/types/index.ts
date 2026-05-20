// Card types
export type CardCategory = 'element' | 'action' | 'special';
export type ElementSubtype = 'person' | 'location' | 'item' | 'time';
export type ActionSubtype = 'relation' | 'behavior' | 'motive' | 'state';
export type CardRarity = 'common' | 'rare' | 'epic';

export interface Card {
  id: string;
  name: string;
  category: CardCategory;
  subtype: ElementSubtype | ActionSubtype | 'why' | 'verify';
  rarity: CardRarity;
  color: string;
  icon: string;
  questionTemplates: string[];
}

// Puzzle types
export interface Puzzle {
  id: string;
  name: string;
  surface: string;
  truth: string;
  coreTruth: string;
  atmosphere: string;
  difficulty: 'easy' | 'medium' | 'hard';
  initialCards: string[];
  cardAnswerMap: Record<string, 'yes' | 'no' | 'irrelevant'>;
  unlockRules: Record<string, string[]>;
  distractors: string[];
  revealBgm?: string;
}

// Game state types
export type GamePhase = 'home' | 'surface' | 'playing' | 'reveal';
export type AnswerType = 'yes' | 'no' | 'irrelevant';

export interface ChatMessage {
  id: string;
  role: 'player' | 'host';
  content: string;
  answerType?: AnswerType;
  cardCombo?: [string, string?];
  timestamp: number;
}

export interface ClueNote {
  id: string;
  content: string;
  source: string;
  x: number;
  y: number;
  rotation: number;
  isHighlighted: boolean;
  groupId?: string;
}

export interface RedStringConnection {
  id: string;
  fromNoteId: string;
  toNoteId: string;
}

export interface HypothesisNote {
  id: string;
  content: string;
  x: number;
  y: number;
}

export interface JudgeRequest {
  sessionId: string;
  puzzleId: string;
  cardCombo: [string, string?];
  question: string;
}

export interface FreeAskRequest {
  sessionId: string;
  puzzleId: string;
  question: string;
}

export interface JudgeResponse {
  answer: AnswerType;
  reply: string;
  unlockCards?: string[];
  newClue?: string;
}

// Story slide types for animated scene presentation
export interface SceneElement {
  emoji: string;
  size: number;         // rem
  x: number;            // % from left
  y: number;            // % from top
  animation: string;    // CSS class name
  delay?: number;       // animation delay in ms
}

export interface StorySlide {
  text: string;
  elements: SceneElement[];
  background: string;   // CSS gradient or color
  mood?: string;        // ambient description
}
