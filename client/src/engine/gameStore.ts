import { create } from 'zustand';
import type {
  Card,
  ChatMessage,
  ClueNote,
  GamePhase,
  HypothesisNote,
  Puzzle,
  RedStringConnection,
} from '../types/index.ts';
import { calculateRating } from '../systems/ratingSystem.ts';
import { canCombine, MAX_HAND_SIZE } from './cardRuleEngine.ts';

function isElementCard(card: Card): boolean {
  return card.category === 'element';
}

function isActionCard(card: Card): boolean {
  return card.category === 'action' || card.category === 'special';
}

interface GameState {
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;

  currentPuzzle: Puzzle | null;
  loadPuzzle: (puzzle: Puzzle) => void;

  sessionId: string | null;
  setSessionId: (id: string) => void;

  hand: Card[];
  selectedElement: Card | null;
  selectedAction: Card | null;
  selectCard: (card: Card) => void;
  clearSelection: () => void;
  addCardToHand: (card: Card) => void;
  removeCardFromHand: (cardId: string) => void;
  initializeHand: (cards: Card[]) => void;
  cardFilter: string;
  setCardFilter: (filter: string) => void;

  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  clueNotes: ClueNote[];
  addClueNote: (note: ClueNote) => void;
  updateClueNote: (id: string, updates: Partial<ClueNote>) => void;
  removeClueNote: (id: string) => void;
  connections: RedStringConnection[];
  addConnection: (conn: RedStringConnection) => void;
  removeConnection: (id: string) => void;
  hypotheses: HypothesisNote[];
  addHypothesis: (note: HypothesisNote) => void;
  updateHypothesis: (id: string, updates: Partial<HypothesisNote>) => void;
  removeHypothesis: (id: string) => void;
  showBoard: boolean;
  setShowBoard: (show: boolean) => void;

  currentQuestion: string | null;
  questionAlternatives: string[];
  questionIndex: number;
  setCurrentQuestion: (q: string, alternatives: string[]) => void;
  cycleQuestion: () => void;
  clearQuestion: () => void;

  irrelevantStreak: number;
  questionCount: number;
  highlightedCardId: string | null;
  setHighlightedCard: (id: string | null) => void;

  rating: string | null;
  setRating: (r: string) => void;

  submitInference: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'home',
  setPhase: (phase) => set({ phase }),

  currentPuzzle: null,
  loadPuzzle: (puzzle) => set({ currentPuzzle: puzzle }),

  sessionId: null,
  setSessionId: (id) => set({ sessionId: id }),

  hand: [],
  selectedElement: null,
  selectedAction: null,

  selectCard: (card) => {
    const { selectedElement, selectedAction } = get();

    if (isElementCard(card)) {
      if (selectedElement?.id === card.id) {
        set({ selectedElement: null, selectedAction: null });
        return;
      }
      set({ selectedElement: card, selectedAction: null });
      return;
    }

    if (isActionCard(card)) {
      if (!selectedElement) return;

      if (selectedAction?.id === card.id) {
        set({ selectedAction: null });
        return;
      }

      if (!canCombine(selectedElement, card)) return;

      set({ selectedAction: card });
      return;
    }
  },

  clearSelection: () => set({ selectedElement: null, selectedAction: null }),

  addCardToHand: (card) =>
    set((state) => {
      if (state.hand.some((c) => c.id === card.id)) return state;
      const hand = [...state.hand, card];
      if (hand.length > MAX_HAND_SIZE) {
        hand.splice(0, hand.length - MAX_HAND_SIZE);
      }
      return { hand };
    }),

  removeCardFromHand: (cardId) =>
    set((state) => ({
      hand: state.hand.filter((c) => c.id !== cardId),
      selectedElement: state.selectedElement?.id === cardId ? null : state.selectedElement,
      selectedAction: state.selectedAction?.id === cardId ? null : state.selectedAction,
    })),

  initializeHand: (cards) =>
    set({
      hand: cards.length > MAX_HAND_SIZE ? cards.slice(-MAX_HAND_SIZE) : cards,
      selectedElement: null,
      selectedAction: null,
    }),

  cardFilter: 'all',
  setCardFilter: (filter) => set({ cardFilter: filter }),

  messages: [],
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),

  clueNotes: [],
  addClueNote: (note) => set((state) => ({ clueNotes: [...state.clueNotes, note] })),
  updateClueNote: (id, updates) =>
    set((state) => ({
      clueNotes: state.clueNotes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    })),
  removeClueNote: (id) =>
    set((state) => ({
      clueNotes: state.clueNotes.filter((n) => n.id !== id),
      connections: state.connections.filter((c) => c.fromNoteId !== id && c.toNoteId !== id),
    })),

  connections: [],
  addConnection: (conn) => set((state) => ({ connections: [...state.connections, conn] })),
  removeConnection: (id) =>
    set((state) => ({ connections: state.connections.filter((c) => c.id !== id) })),

  hypotheses: [],
  addHypothesis: (note) => set((state) => ({ hypotheses: [...state.hypotheses, note] })),
  updateHypothesis: (id, updates) =>
    set((state) => ({
      hypotheses: state.hypotheses.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    })),
  removeHypothesis: (id) =>
    set((state) => ({ hypotheses: state.hypotheses.filter((n) => n.id !== id) })),

  showBoard: false,
  setShowBoard: (show) => set({ showBoard: show }),

  currentQuestion: null,
  questionAlternatives: [],
  questionIndex: 0,
  setCurrentQuestion: (q, alternatives) =>
    set({
      currentQuestion: q,
      questionAlternatives: alternatives.length > 0 ? alternatives : [q],
      questionIndex: 0,
    }),
  cycleQuestion: () =>
    set((state) => {
      const { questionAlternatives } = state;
      if (questionAlternatives.length === 0) return state;
      const nextIndex = (state.questionIndex + 1) % questionAlternatives.length;
      return {
        questionIndex: nextIndex,
        currentQuestion: questionAlternatives[nextIndex],
      };
    }),
  clearQuestion: () =>
    set({ currentQuestion: null, questionAlternatives: [], questionIndex: 0 }),

  irrelevantStreak: 0,
  questionCount: 0,
  highlightedCardId: null,
  setHighlightedCard: (id) => set({ highlightedCardId: id }),

  rating: null,
  setRating: (r) => set({ rating: r }),

  submitInference: () => {
    const { questionCount } = get();
    const rating = calculateRating(questionCount);
    set({
      rating,
      showBoard: false,
      phase: 'reveal',
    });
  },

  resetGame: () =>
    set({
      phase: 'home',
      currentPuzzle: null,
      sessionId: null,
      hand: [],
      selectedElement: null,
      selectedAction: null,
      cardFilter: 'all',
      messages: [],
      isLoading: false,
      clueNotes: [],
      connections: [],
      hypotheses: [],
      showBoard: false,
      currentQuestion: null,
      questionAlternatives: [],
      questionIndex: 0,
      irrelevantStreak: 0,
      questionCount: 0,
      highlightedCardId: null,
      rating: null,
    }),
}));
